import { FocusTools, GeneralSteps, Keyboard, Keys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('SpecialKeyingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          classes: 'special-keying'
        },
        containerBehaviours: Behaviour.derive([
          Focusing.config({ }),
          Keying.config({
            mode: 'special',
            onSpace: store.adderH('space'),
            onEnter: store.adderH('enter'),
            onShiftEnter: store.adderH('shift+enter'),
            onLeft: store.adderH('left'),
            onUp: store.adderH('up'),
            onDown: store.adderH('down'),
            onRight: store.adderH('right'),
            onEscape: store.adderH('escape')
          })
        ])
      })
    );

  }, function (doc, body, gui, component, store) {
    const press = function (expected, key, modifiers) {
      return GeneralSteps.sequence([
        store.sClear,
        Keyboard.sKeydown(doc, key, modifiers),
        store.sAssertEq('Pressing ' + expected, [ expected ])
      ]);
    };

    return [
      GuiSetup.mSetupKeyLogger(body),
      FocusTools.sSetFocus('Start on component', gui.element(), '.special-keying'),
      press('space', Keys.space(), { }),
      press('enter', Keys.enter(), { }),
      press('shift+enter', Keys.enter(), { shift: true }),
      press('left', Keys.left(), { }),
      press('up', Keys.up(), { }),
      press('down', Keys.down(), { }),
      press('right', Keys.right(), { }),
      press('escape', Keys.escape(), { }),
      GuiSetup.mTeardownKeyLogger(body, [ ])
    ];
  }, function () { success(); }, failure);
});
