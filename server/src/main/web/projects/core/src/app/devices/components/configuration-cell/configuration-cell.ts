import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { BaseCellRenderer } from 'hmdm-ui-kit';
import { TDevice } from '../../types/device.type';
import { Router } from '@angular/router';

@Component({
  selector: 'core-configuration-cell',
  templateUrl: './configuration-cell.html',
  styleUrl: './configuration-cell.scss',
  imports: [],
})
export class ConfigurationCell extends BaseCellRenderer<TDevice, null> implements OnInit {
  private readonly router = inject(Router);

  configurationName: WritableSignal<string> = signal('');

  ngOnInit(): void {
    const configuration = this.params().data?.configuration.name ?? '';
    this.configurationName.set(configuration);
  }

  onClick(): void {
    this.router.navigate([
      'home',
      'configurations',
      'details',
      this.params().data?.configuration.id,
    ]);
  }
}
