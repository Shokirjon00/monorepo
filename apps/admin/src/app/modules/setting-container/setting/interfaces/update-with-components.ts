import { IComponent } from "@modules/setting-container/setting/interfaces/components";

export interface UpdateWithComponents {
  id: string;
  description: string;
  components: IComponent[];
}
