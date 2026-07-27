package com.hmdm.auth;

import com.google.inject.Inject;
import com.hmdm.persistence.UnsecureDAO;
import com.hmdm.persistence.domain.User;
import com.hmdm.persistence.domain.UserRole;
import com.unboundid.ldap.sdk.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.inject.Named;
import jakarta.inject.Singleton;

@Singleton
public class LDAPAuth implements IHmdmAuth {

    private Logger logger = LoggerFactory.getLogger(LDAPAuth.class);

    private boolean ldapAdminBind;
    private String ldapHost;
    private int ldapPort;
    private String ldapBaseDn;
    private String ldapAdminDn;
    private String ldapAdminPassword;
    private String ldapUsernameAttribute;
    private String ldapUserDn;
    private String ldapDefaultRole;
    private int ldapCustomerId;

    private UnsecureDAO userDAO;
    private LDAPConnection ldapConnection;

    @Inject
    public LDAPAuth(UnsecureDAO userDAO,
                    @Named("ldap.admin.bind") boolean ldapAdminBind,
                    @Named("ldap.host") String ldapHost,
                    @Named("ldap.port") int ldapPort,
                    @Named("ldap.base.dn") String ldapBaseDn,
                    @Named("ldap.admin.dn") String ldapAdminDn,
                    @Named("ldap.admin.password") String ldapAdminPassword,
                    @Named("ldap.username.attribute") String ldapUsernameAttribute,
                    @Named("ldap.user.dn") String ldapUserDn,
                    @Named("ldap.default.role") String ldapDefaultRole,
                    @Named("ldap.customer.id") int ldapCustomerId) {
        this.userDAO = userDAO;
        this.ldapAdminBind = ldapAdminBind;
        this.ldapHost = ldapHost;
        this.ldapPort = ldapPort;
        this.ldapBaseDn = ldapBaseDn;
        this.ldapAdminDn = ldapAdminDn;
        this.ldapAdminPassword = ldapAdminPassword;
        this.ldapUsernameAttribute = ldapUsernameAttribute;
        this.ldapUserDn = ldapUserDn;
        this.ldapDefaultRole = ldapDefaultRole;
        this.ldapCustomerId = ldapCustomerId;
    }

    private LDAPConnection getConnection() {
        if (ldapConnection == null) {
            ldapConnection = new LDAPConnection();
        }
        return ldapConnection;
    }

    private void connect() throws LDAPException {
        LDAPConnection conn = getConnection();
        if (!conn.isConnected()) {
            conn.connect(ldapHost, ldapPort);
        }
    }

    private void disconnect() {
        getConnection().close();
        ldapConnection = null;
    }

    @Override
    public User findUser(String login) {
        boolean newUser = false;
        User user = userDAO.findByLoginOrEmail(login);
        if (user == null) {
            user = new User();
            user.setLogin(login);
            user.setCustomerId(ldapCustomerId);
            user.setAllConfigAvailable(true);
            user.setAllDevicesAvailable(true);
            user.setPassword("");       // The password column is NOT NULL
        }

        if (ldapAdminBind) {
            try {
                connect();
            } catch (LDAPException e) {
                logger.error("Failed to connect to ldap://" + ldapHost + ":" + ldapPort + ": " + e.getDiagnosticMessage());
                e.printStackTrace();
                disconnect();
                return null;
            }
            try {
                BindResult bindResult = getConnection().bind(ldapAdminDn, ldapAdminPassword);
                if (!bindResult.getResultCode().equals(ResultCode.SUCCESS)) {
                    logger.error("Failed to bind to ldap://" + ldapHost + ":" + ldapPort +
                            " using " + ldapAdminDn + ": " + bindResult.getDiagnosticMessage());
                    disconnect();
                    return null;
                }
            } catch (LDAPException e) {
                logger.error("Failed to bind to ldap://" + ldapHost + ":" + ldapPort +
                        " using " + ldapAdminDn + ": " + e.getDiagnosticMessage());
                e.printStackTrace();
                disconnect();
                return null;
            }
            if (!setUserDetails(user)) {
                disconnect();
                return null;
            }
        } else {
            // If no admin password is specified, we just create a user without any LDAP requests
            // (the LDAP request will be done during the authenticate() method)
            // Here we just store the user's DN in the appData field to use it in Authenticate
            user.setAuthData(ldapUserDn.replace("${username}", login));
        }

        if (user.getUserRole() == null) {
            UserRole userRole = userDAO.findRoleByNameUnsecure(ldapDefaultRole);
            if (userRole == null) {
                logger.warn("Default user role not found, user can't be created");
                return null;
            }
            user.setUserRole(userRole);
        }
        userDAO.updateUserUnsecure(user);

        // Reload the user to fill the role permissions
        user = userDAO.findByLoginOrEmail(user.getLogin());

        return user;
    }

    @Override
    public boolean authenticate(User user, String password) {
        try {
            // This method just does nothing if already connected
            connect();
        } catch (LDAPException e) {
            logger.error("Failed to connect to ldap://" + ldapHost + ":" + ldapPort + ": " + e.getDiagnosticMessage());
            e.printStackTrace();
            disconnect();
            return false;
        }

        try {
            BindResult bindResult = getConnection().bind(user.getAuthData(), password);
            if (!bindResult.getResultCode().equals(ResultCode.SUCCESS)) {
                logger.error("Failed to bind to ldap://" + ldapHost + ":" + ldapPort +
                        " using " + ldapAdminDn + ": " + bindResult.getDiagnosticMessage());
                disconnect();
                return false;
            }
        } catch (LDAPException e) {
            logger.error("Failed to bind to ldap://" + ldapHost + ":" + ldapPort +
                    " using " + ldapAdminDn + ": " + e.getDiagnosticMessage());
            e.printStackTrace();
            disconnect();
            return false;
        }

        // If we didn't search for user details earlier in findUser(), do it here
        if (!ldapAdminBind) {
            // Notice: if setUserDetails fails, this is not an error, the authentication is still successful
            if (setUserDetails(user)) {
                userDAO.updateUserUnsecure(user);

                // Fill the user role permissions by reloading from the database
                User dbUser = userDAO.findByLoginOrEmail(user.getLogin());
                user.setUserRole(dbUser.getUserRole());
            }
        }

        disconnect();
        return true;
    }

    private boolean setUserDetails(User user) {
        try {
            String filter = ldapUsernameAttribute + "=" + user.getLogin();
            SearchResult searchResult = getConnection().search(ldapBaseDn, SearchScope.SUB, filter,
                    "givenName", "memberOf");
            if (searchResult.getEntryCount() == 0) {
                logger.info("LDAP user " + user.getLogin() + " not found");
                return false;
            }
            SearchResultEntry entry = searchResult.getSearchEntries().get(0);
            String dn = entry.getDN();
            logger.info("LDAP user " + user.getLogin() + " DN: " + dn);
            user.setAuthData(dn);   // Save DN for future usage
            Attribute name = entry.getAttribute("givenName");
            user.setName(name.getValue());
            Attribute memberOf = entry.getAttribute("memberOf");
            setUserRole(user, memberOf);

        } catch (LDAPSearchException e) {
            logger.error("Failed to search for " + user.getLogin() + " on ldap://" + ldapHost + ":" + ldapPort +
                    ": " + e.getDiagnosticMessage());
            e.printStackTrace();
            return false;
        }
        return true;
    }

    private boolean setUserRole(User user, Attribute memberOf) {
        if (memberOf == null) {
            return false;
        }
        String[] groups = memberOf.getValues();
        for (String group : groups) {
            if (group.length() < 9) {
                logger.warn("Wrong group DN, ignored: " + group);
                continue;
            }
            if (!group.substring(0, 8).equalsIgnoreCase("cn=HMDM-")) {
                // Not our group, continue
                logger.debug("Group DN ignored: " + group);
                continue;
            }
            int pos = group.indexOf(',');
            if (pos == -1) {
                pos = group.length();
            }
            String groupName = group.substring(8, pos);
            UserRole userRole = userDAO.findRoleByNameUnsecure(groupName);
            if (userRole != null) {
                logger.info("Setting user role: " + groupName);
                user.setUserRole(userRole);
                return true;
            }
        }
        return false;
    }
}
