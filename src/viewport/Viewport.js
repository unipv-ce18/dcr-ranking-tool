// noinspection ES6UnusedImports
import dom, {Fragment} from 'jsx-render';

import './vpstyle.scss';
import {generateCsv, generateJson, saveData} from '../io';

const STORE_KEY = 'rankings';
const OUTPUT_FILENAME_DEFAULT = 'out';

export default class Viewport {

  constructor(props) {
    this.props = props;
    this.render = this.render.bind(this);
    this._keyListener = this._keyListener.bind(this);

    let savedRankings = null;
    try {
      let ranksStr = sessionStorage.getItem(STORE_KEY);
      savedRankings = ranksStr !== null ? JSON.parse(ranksStr) : null;
    } catch (e) {
      console.error("Cannot load rankings from storage, using new set", e);
    }
    this.rankings = savedRankings !== null ? savedRankings : Array(IMAGE_FILES.length);

    this.currentIndex = props.index;

    document.addEventListener('keyup', this._keyListener);
  }

  render(props) {
    let tree = (
      <Fragment>
        <div id="vp">
          <img src="#" id="image"/>
        </div>
        <div id="vp-control">
          <div id="vp-counter"></div>
          <div id="rating">
            <input name="rating" type="radio" tabIndex="-1"/>
            <input name="rating" type="radio" tabIndex="-1"/>
            <input name="rating" type="radio" tabIndex="-1"/>
            <input name="rating" type="radio" tabIndex="-1"/>
            <input name="rating" type="radio" tabIndex="-1"/>
          </div>
        </div>
      </Fragment>);

    this.imageElement = tree.getElementById('image');
    this.counterElement = tree.getElementById('vp-counter');
    this.markRadios = tree.getElementById('rating').childNodes;
    for (let i = 0; i < this.markRadios.length; ++i) {
      this.markRadios[i].addEventListener('click', e => {
        this._setCurrentRank(i + 1, true);
        this.markRadios[i].blur();
      });
    }

    this.switchImage(this.currentIndex);

    return tree;
  }

  switchImage(idx) {
    console.log(this.rankings);

    this.imageElement.src = IMAGES_PATH + IMAGE_FILES[idx];
    this.counterElement.textContent = (idx + 1) + '/' + IMAGE_FILES.length;
    this.lastSwitchTime = Date.now();
    console.log('Switched to image #%d', idx + 1);

    if (this.props.onImageSwitch != null)
      this.props.onImageSwitch(idx);

    let rank = this.rankings[idx] != null ? this.rankings[idx].r : null;
    this._setCurrentRank(rank, false);
  }

  detachListeners() {
    document.removeEventListener('keyup', this._keyListener);
  }

  _setCurrentRank(rank, store) {
    if (rank == null || rank === 0)
      this.markRadios.forEach(it => it.checked = false);
    else {
      this.markRadios[rank - 1].checked = true;
    }
    if (store) {
      let selTime = Date.now() - this.lastSwitchTime;
      this.rankings[this.currentIndex] = rank !== 0 ? {r: rank, t: selTime} : undefined;
      sessionStorage.setItem(STORE_KEY, JSON.stringify(this.rankings));
      console.log('Image #%d assessed, rating %d (in %dms)', this.currentIndex + 1, rank, selTime);
    }
  }

  _clearRanks() {
    this.rankings = Array(IMAGE_FILES.length);
    sessionStorage.setItem(STORE_KEY, JSON.stringify(this.rankings));
  }

  _keyListener(e) {
    switch (e.code) {
      case 'ArrowUp':
      case 'ArrowLeft':
        if (this.currentIndex > 0)
          this.switchImage(--this.currentIndex);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        if (this.currentIndex < IMAGE_FILES.length - 1)
          this.switchImage(++this.currentIndex);
        break;
      case 'Digit0':
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
        this._setCurrentRank(parseInt(e.key), true);
        break;
      case 'KeyS':
      case 'Enter':
        if (this._checkAllFilledIn()) {
          let output = e.shiftKey
            ? { name: 'CSV', ext: '.csv', mime: 'text/csv', gen: generateCsv }
            : { name: 'JSON', ext: '.json', mime: 'text/json', gen: generateJson };

          let fileName = prompt('Output filename ('+ output.name + ')', OUTPUT_FILENAME_DEFAULT);
          if (fileName !== null && fileName !== '')
            saveData(output.gen(IMAGE_FILES, this.rankings), fileName + output.ext, output.mime);
        }
        break;
      case 'KeyC':
      case 'Backspace':
        if (confirm('Start a new session?')) {
          this._clearRanks();
          this.switchImage(this.currentIndex = 0);
        }
        break;
    }
  }

  _checkAllFilledIn() {
    let notRankedIdx = this.rankings.findIndex(e => e == null);

    // If there is at least an unassessed image and the user aborts the dialog, show the image
    if (notRankedIdx !== -1 && !confirm('There are still unassessed images in this collection, are you sure?')) {
      this.switchImage(this.currentIndex = notRankedIdx);
      return false;
    }

    return true;
  }

}
