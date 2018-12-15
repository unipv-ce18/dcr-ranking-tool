<h1 align="center">Subjective Image Ranking tool</h2>
<h4 align="center"><i>…for the Digital Content Retrieval course</i></h4>

### What is this thing?
This is a minimalistic user interface for image quality assessment:
the user can express a rank on a list of shown images, one after another.

At the end of the experiment data can be exported for further processing.

### Building
Since _AFAIK_ Javascript in a browser sandbox cannot enumerate files in a
directory, a different project build is required for each set of images.

The image array is shuffled on each build: if you don't like the generated
sequence of images, simply rebuild the project again.

```console
# Install dependencies locally
$ yarn install

# Move your pictures to the images/ folder

# Build the project
$ yarn build
```

You can now move `dist/` and `images/` wherever you want.

### Usage
Open `dist/index.html` either locally or on a web server; if everything is OK,
the first image of the randomized set will be shown.

The application is entirely operated by using the keyboard:

|  Key  | Action |
| :---: | --- |
| `←`, `↑` | Go to the previous image |
| `→`, `↓` | Go to the next image |
| `0` | Clears the rank given to the current image |
| `1` : `5` | Apply a rank to the current image |
| `s`, `Enter` | Opens a prompt to save collected as JSON (shift for CSV) |
| `c`, `Backspace` | Starts a new session / clears all the collected data |

During the experiment, the given marks are stored in your browser's
session storage: reloading the page won't erase them, but closing the
window will!

Once exported, you can further process the collected data on your own, for
example, by using [this MATLAB script](matlab/resultshow.m) to plot the results.

---

This trivial project is completely _free and open source software_ licensed
under the [GNU General Public License, version 3](LICENSE).

If you have an idea, found a bug and want to contribute, thanks!
Your help is very much appreciated.

