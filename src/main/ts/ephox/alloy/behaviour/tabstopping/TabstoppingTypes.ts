import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';

export interface TabstoppingBehaviour extends Behaviour.AlloyBehaviour<TabstoppingConfigSpec, TabstoppingConfig> {
  config: (config: TabstoppingConfigSpec) => Behaviour.NamedConfiguredBehaviour<TabstoppingConfigSpec, TabstoppingConfig>;
}
export interface TabstoppingConfigSpec extends BehaviourConfigSpec {
  // intentionally blank
}

export interface TabstoppingConfig extends Behaviour.BehaviourConfigDetail {
  tabAttr: () => string;
}
