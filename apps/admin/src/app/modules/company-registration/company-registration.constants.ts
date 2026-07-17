import {ITab} from "@core/interfaces/header.interface";

export class CompaniesRegistrationConstanta {

  static HEADERS_TABS: ITab[] = [
      {
        label: 'Организация',
        path: `/company-registration-applications/list-registration`,
        permissionName: '',
      },
      {
        label: 'Торгорвые точки',
        path: `/company-registration-applications/retail-outlet`,
        permissionName: '',
      },
    ]
}

