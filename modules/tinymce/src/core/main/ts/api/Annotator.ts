import { Arr, Obj, Optional } from '@ephox/katamari';
import { Remove, SugarNode } from '@ephox/sugar';

import * as AnnotationChanges from '../annotate/AnnotationChanges';
import * as AnnotationFilter from '../annotate/AnnotationFilter';
import { create } from '../annotate/AnnotationsRegistry';
import { findAll, identify } from '../annotate/Identification';
import { annotateWithBookmark, Decorator, DecoratorData, removeDirectAnnotation } from '../annotate/Wrapping';
import Editor from './Editor';

export type AnnotationListenerApi = AnnotationChanges.AnnotationListener;

/**
 * This is the annotator api.
 *
 * @class tinymce.Annotator
 */

export interface AnnotatorSettings {
  decorate: Decorator;
  persistent?: boolean;
}

interface Annotator {
  register: (name: string, settings: AnnotatorSettings) => void;
  annotate: (name: string, data: DecoratorData) => void;
  annotationChanged: (name: string, f: AnnotationListenerApi) => void;
  remove: (name: string) => void;
  removeAll: (name: string) => void;
  getAll: (name: string) => Record<string, Element[]>;
}

const Annotator = (editor: Editor): Annotator => {
  const registry = create();
  AnnotationFilter.setup(editor, registry);
  const changes = AnnotationChanges.setup(editor, registry);

  return {
    /**
     * Registers a specific annotator by name
     *
     * @method register
     * @param {String} name the name of the annotation
     * @param {Object} settings settings for the annotation (e.g. decorate)
     */
    register: (name: string, settings: AnnotatorSettings) => {
      registry.register(name, settings);
    },

    /**
     * Applies the annotation at the current selection using data
     *
     * @method annotate
     * @param {String} name the name of the annotation to apply
     * @param {Object} data information to pass through to this particular
     * annotation
     */
    annotate: (name: string, data: { }) => {
      registry.lookup(name).each((settings) => {
        annotateWithBookmark(editor, name, settings, data);
      });
    },

    /**
     * Executes the specified callback when the current selection matches the annotation or not.
     *
     * @method annotationChanged
     * @param {String} name Name of annotation to listen for
     * @param {Function} callback Callback with (state, name, and data) fired when the annotation
     * at the cursor changes. If state if false, data will not be provided.
     */
    annotationChanged: (name: string, callback: AnnotationListenerApi) => {
      changes.addListener(name, callback);
    },

    /**
     * Removes any annotations from the current selection that match
     * the name
     *
     * @method remove
     * @param {String} name the name of the annotation to remove
     */
    remove: (name: string): void => {
      const bookmark = editor.selection.getBookmark();
      identify(editor, Optional.some(name)).each(({ elements }) => {
        Arr.each(elements, (element) => {
          if (SugarNode.isTag('span')(element)) {
            Remove.unwrap(element);
          } else {
            removeDirectAnnotation(element);
          }
        });
      });
      editor.selection.moveToBookmark(bookmark);
    },

    /**
     * Removes all annotations that match the specified name from the entire document.
     *
     * @method removeAll
     * @param {String} name the name of the annotation to remove
     */
    removeAll: (name: string): void => {
      const bookmark = editor.selection.getBookmark();
      Obj.each(findAll(editor, name), (elements, _) => {
        Arr.each(elements, (element) => {
          // console.log(elements);
          if (SugarNode.isTag('span')(element)) {
            Remove.unwrap(element);
          } else {
            removeDirectAnnotation(element);
          }
        });
      });
      editor.selection.moveToBookmark(bookmark);
    },

    /**
     * Retrieve all the annotations for a given name
     *
     * @method getAll
     * @param {String} name the name of the annotations to retrieve
     * @return {Object} an index of annotations from uid => DOM nodes
     */
    getAll: (name: string): Record<string, Element[]> => {
      const directory = findAll(editor, name);
      return Obj.map(directory, (elems) => Arr.map(elems, (elem) => elem.dom));
    }
  };
};

export default Annotator;
