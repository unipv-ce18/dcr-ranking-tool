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

    if (this.props.onImageSwitch != null)
      this.props.onImageSwitch(idx);

    let rank = this.rankings[idx];
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
      this.rankings[this.currentIndex] = rank !== 0 ? rank : undefined;
      sessionStorage.setItem(STORE_KEY, JSON.stringify(this.rankings));
    }
  }

  _clearRanks() {
    this.rankings = Array(IMAGE_FILES.length);
    sessionStorage.setItem(STORE_KEY, JSON.stringify(this.rankings));
  }

  _keyListener(e) {
    switch (e.key) {
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
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        this._setCurrentRank(parseInt(e.key), true);
        break;
      case 'S':
        if (this._checkAllFilledIn()) {
          let fn = prompt('Output filename (CSV)', OUTPUT_FILENAME_DEFAULT);
          if (fn !== null && fn !== '')
            saveData(generateCsv(IMAGE_FILES, this.rankings), fn + '.csv', 'text/csv');
        }
        break;
      case 's':
        if (this._checkAllFilledIn()) {
          let fn = prompt('Output filename (JSON)', OUTPUT_FILENAME_DEFAULT);
          if (fn !== null && fn !== '')
            saveData(generateJson(IMAGE_FILES, this.rankings), fn + '.json', 'text/json');
        }
        break;
      case 'c':
        if (confirm('Clear all data?')) {
          this._setCurrentRank(0, false);
          this._clearRanks();
        }
        break;
    }
  }

  _checkAllFilledIn() {
    function notComplete(ranks) {
      for (let i = 0; i < ranks.length; ++i)
        if (ranks[i] == null || ranks[i] === 0) return i;
      return -1;
    }

    let notRankedIdx = notComplete(this.rankings);

    // If there is at least an unassessed image and the user aborts the dialog, show the image
    if (notRankedIdx !== -1 && !confirm('There are still unassessed images in this collection, are you sure?')) {
      this.currentIndex = notRankedIdx;
      this.switchImage(notRankedIdx);
      return false;
    }

    return true;
  }

}
