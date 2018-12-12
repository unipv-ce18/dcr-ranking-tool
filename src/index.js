// noinspection ES6UnusedImports
import dom, {Fragment} from 'jsx-render';

import './style.scss';
import Viewport from './viewport/viewport';

function getLocationHashIndex() {
  let h = window.location.hash;
  if (h === '') return 0;

  h = h.substring(1);
  try {
    return parseInt(h) - 1;
  } catch (e) {
    console.error('Cannot parse index from URL hash, starting at 0', e);
    return 0;
  }
}

function clearElementContent(node) {
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }
}

window.addEventListener('load', () => {
  console.log('Hardcoded images array: ', IMAGE_FILES);

  clearElementContent(document.body);

  document.body.appendChild(<Viewport
    index={getLocationHashIndex()}
    onImageSwitch={(idx) => window.location.hash = '#' + (idx + 1)}/>);

  document.body.focus();
});
