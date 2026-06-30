import { IComponent } from "@modules/setting-container/setting/interfaces/components";

export interface ISetting {
  id: string;
  name: string;
  code: string;
  description: string;
  settingJson: string;
  components: IComponent[];
  modifiedAt: string;
  htmlCode: string;
}
