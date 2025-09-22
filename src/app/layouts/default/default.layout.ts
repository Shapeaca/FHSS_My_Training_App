import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { ByuFooterComponent, ByuHeaderComponent, HeaderConfig } from '@fhss-web-team/frontend-utils';
import { Permission } from '../../../security';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, ByuHeaderComponent, ByuFooterComponent],
  templateUrl: './default.layout.html',
  styleUrl: './default.layout.scss',
})
export class DefaultLayout {
  readonly headerConfig: HeaderConfig<Permission> = {
    title: 'FHSS Starter App',
    menu: [{ text: 'Home', path: '/' }],
  };
}
