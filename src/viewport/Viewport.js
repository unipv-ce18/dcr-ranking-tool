// noinspection ES6UnusedImports
import dom, {Fragment} from 'jsx-render';

import './vpstyle.scss';
import {generateCsv, generateJson, saveData} from '../export';

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
          <a class="vp-button" id="btn-submit" title="Save collected data">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path fill="none" d="M0 0h24v24H0V0z"/>
              <path d="M19 13v5c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-5c0-.55-.45-1-1-1s-1 .45-1 1v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1zm-6-.33l1.88-1.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-3.59 3.59c-.39.39-1.02.39-1.41 0L7.7 12.2c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L11 12.67V4c0-.55.45-1 1-1s1 .45 1 1v8.67z"/>
            </svg>
          </a>
          <a class="vp-button" id="btn-clear" title="Start a new session">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V2.21c0-.45-.54-.67-.85-.35l-3.8 3.79c-.2.2-.2.51 0 .71l3.79 3.79c.32.31.86.09.86-.36V7c3.73 0 6.68 3.42 5.86 7.29-.47 2.27-2.31 4.1-4.57 4.57-3.57.75-6.75-1.7-7.23-5.01-.07-.48-.49-.85-.98-.85-.6 0-1.08.53-1 1.13.62 4.39 4.8 7.64 9.53 6.72 3.12-.61 5.63-3.12 6.24-6.24C20.84 9.48 16.94 5 12 5z"/>
            </svg>
          </a>
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
    this.saveButton = tree.getElementById('btn-submit');
    this.saveButton.addEventListener('click', this._onSave.bind(this));
    this._updateSaveButtonState();
    tree.getElementById('btn-clear').addEventListener('click', this._onClear.bind(this));

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
      this._updateSaveButtonState();
      console.log('Image #%d assessed, rating %d (in %dms)', this.currentIndex + 1, rank, selTime);
    }
  }

  _clearRanks() {
    this.rankings = Array(IMAGE_FILES.length);
    sessionStorage.setItem(STORE_KEY, JSON.stringify(this.rankings));
    this._updateSaveButtonState();
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
        this._onSave(e);
        break;
      case 'KeyC':
      case 'Backspace':
        this._onClear(e);
        break;
    }
  }

  _onSave(e) {
    if (this._checkAllFilledIn()) {
      let output = e.shiftKey
        ? { name: 'CSV', ext: '.csv', mime: 'text/csv', gen: generateCsv }
        : { name: 'JSON', ext: '.json', mime: 'text/json', gen: generateJson };

      let fileName = prompt('Output filename ('+ output.name + ')', OUTPUT_FILENAME_DEFAULT);
      if (fileName !== null && fileName !== '')
        saveData(output.gen(IMAGE_FILES, this.rankings), fileName + output.ext, output.mime);
    }
    if (e instanceof MouseEvent) e.preventDefault();
  }

  _onClear(e) {
    if (confirm('Start a new session?')) {
      this._clearRanks();
      this.switchImage(this.currentIndex = 0);
    }
    if (e instanceof MouseEvent) e.preventDefault();
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

  _updateSaveButtonState() {
    if (this.rankings.findIndex(e => e == null) === -1)
      this.saveButton.classList.add('complete');
    else
      this.saveButton.classList.remove('complete');
  }

}
