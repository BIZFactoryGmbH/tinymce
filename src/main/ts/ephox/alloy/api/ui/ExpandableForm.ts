import { Merger } from '@ephox/katamari';

import * as AlloyParts from '../../parts/AlloyParts';
import * as ExpandableFormSchema from '../../ui/schema/ExpandableFormSchema';
import * as Behaviour from '../behaviour/Behaviour';
import { Representing } from '../behaviour/Representing';
import { Sliding } from '../behaviour/Sliding';
import SketchBehaviours from '../component/SketchBehaviours';
import Form from './Form';
import * as Sketcher from './Sketcher';

const runOnExtra = function (detail, operation) {
  return function (anyComp) {
    AlloyParts.getPart(anyComp, detail, 'extra').each(operation);
  };
};

const factory = function (detail, components, spec, _externals) {
  const getParts = function (form) {
    return AlloyParts.getPartsOrDie(form, detail, [ 'minimal', 'extra' ]);
  };

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components,

    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Representing.config({
          store: {
            mode: 'manual',
            getValue (form) {
              const parts = getParts(form);
              const minimalValues = Representing.getValue(parts.minimal());
              const extraValues = Representing.getValue(parts.extra());
              return Merger.deepMerge(
                minimalValues,
                extraValues
              );
            },
            setValue (form, values) {
              const parts = getParts(form);
              // ASSUMPTION: Form ignore values that it does not have.
              Representing.setValue(parts.minimal(), values);
              Representing.setValue(parts.extra(), values);
            }
          }
        })
      ]),
      SketchBehaviours.get(detail.expandableBehaviours())
    ),

    apis: {
      toggleForm: runOnExtra(detail, Sliding.toggleGrow),
      collapseForm: runOnExtra(detail, Sliding.shrink),
      collapseFormImmediately: runOnExtra(detail, Sliding.immediateShrink),
      expandForm: runOnExtra(detail, Sliding.grow),
      getField (form, key) {
        return AlloyParts.getPart(form, detail, 'minimal').bind(function (minimal) {
          return Form.getField(minimal, key);
        }).orThunk(function () {
          return AlloyParts.getPart(form, detail, 'extra').bind(function (extra) {
            return Form.getField(extra, key);
          });
        });
      }
    }
  };

};

export default <any> Sketcher.composite({
  name: 'ExpandableForm',
  configFields: ExpandableFormSchema.schema(),
  partFields: ExpandableFormSchema.parts(),
  factory,
  apis: {
    getField (apis, component, key) {
      return apis.getField(component, key);
    },
    toggleForm (apis, component) {
      apis.toggleForm(component);
    },
    collapseForm (apis, component) {
      apis.collapseForm(component);
    },
    collapseFormImmediately (apis, component) {
      apis.collapseFormImmediately(component);
    },
    expandForm (apis, component) {
      apis.expandForm(component);
    }
  }
});