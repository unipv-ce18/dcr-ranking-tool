export function saveData(data, filename, type) {
  let file;
  try {
    file = new File([data], filename, {type: type})
  } catch (e) {
    console.error("Cannot construct file", e);
    file = new Blob([data], {type: type})
  }

  let aTag = document.createElement('a');
  aTag.download = filename;
  aTag.href = URL.createObjectURL(file);
  document.body.appendChild(aTag);

  aTag.click();
  setTimeout(function () {
    document.body.removeChild(aTag);
    URL.revokeObjectURL(aTag.href);
  }, 0);
}

export function generateCsv(imgNames, rankings) {
  let lines = [];
  for (let i = 0; i < imgNames.length; ++i)
    lines.push(imgNames[i] + ',' + (rankings[i] != null ? (rankings[i].r + ',' + rankings[i].t) : '0,0'));
  lines.push('');
  return lines.join('\r\n');
}

export function generateJson(imgNames, rankings) {
  let obj = {};
  for (let i = 0; i < imgNames.length; ++i)
    obj[imgNames[i]] = (rankings[i] != null ? rankings[i] : {r:0, t: 0});
  return JSON.stringify(obj);
}
