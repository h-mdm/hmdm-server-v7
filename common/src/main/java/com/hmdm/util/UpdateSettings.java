package com.hmdm.util;

public class UpdateSettings {
    // Set to false for custom web builds
    public static boolean WEB_UPDATE_ENABLED = true;

    // Here CUSTOMER_DOMAIN template can be used, replaced with the customer's domain
    // In the future, this could be used to limit access to updates
    public static String MANIFEST_URL = "https://h-mdm.com/hmdm-update-master.manifest.json";

    public static String STAT_URL = "https://app.h-mdm.com/rest/public/stats";

    // Set to different values for different build variants
    public static String WEB_SUFFIX = "master";

    public static String WEB_UPDATE_USERNAME = "client";
    public static String WEB_UPDATE_PASSWORD = "#xZ359.3";
}
