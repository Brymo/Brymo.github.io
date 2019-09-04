function key(cipherCode) {
  var ascii = chr => {
    return chr.charCodeAt(0);
  };

  var getKeyLength = ciphertext => {
    let ICList = [];

    let cipherChars = ciphertext.split("");

    for (let keyLen = 1; keyLen < 20; keyLen++) {
      let ICSum = 0.0;

      let freqList = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]; // 26 0's
      for (let col = 0; col < keyLen; col++) {
        let colLength = 0.0;
        let chr = 0;
        while (chr < cipherChars.length) {
          if (chr % keyLen == col) {
            freqList[ascii(cipherChars[chr]) - ascii("A")] += 1;
            colLength++;
          }
          chr++;
        }

        let sum = 0.0;
        for (let i = 0; i < 26; i++) sum += freqList[i] * (freqList[i] - 1);

        ICSum += sum / ((colLength * (colLength - 1)) / 26);

        freqList = [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ];
      }

      ICList.push(ICSum / keyLen);
    }

    let maxIC = Math.max(...ICList);
    const tweakCoefficient = 0.2;
    const maxIndex = ICList.findIndex(element => element == maxIC) + 1; //Accomodate for there being no 0 key
    const otherCandidates = ICList.filter(
      (IC, index) =>
        IC > maxIC - tweakCoefficient && maxIndex % (index + 1) == 0
    );
    const runnerUp =
      otherCandidates.length > 0
        ? ICList.findIndex(element => element == otherCandidates[0]) + 1
        : null;
    return runnerUp == null ? maxIndex : runnerUp;
  };

  var getColumn = (cipherText, columnNumber, keyLength) => {
    let columnString = [];
    let count = columnNumber;
    let columnChars = cipherText.split("");
    while (count < columnChars.length) {
      if (count % keyLength == columnNumber)
        columnString.push(columnChars[count]);
      count++;
    }

    return columnString;
  };

  var decryptColumn = (column, potentialKey) => {
    let decrypted = [];

    for (let i = 0; i < column.length; i++) {
      let chr = column[i];
      let letter = String.fromCharCode(
        mod(ascii(chr) - ascii(potentialKey), 26) + ascii("A")
      );
      decrypted.push(letter);
    }

    return decrypted;
  };

  var mod = (base, modulus) => {
    return ((base % modulus) + modulus) % modulus;
  };

  function englishFrequencies() {
    return {
      A: 8.167,
      B: 1.492,
      C: 2.782,
      D: 4.253,
      E: 12.702,
      F: 2.228,
      G: 2.015,
      H: 6.094,
      I: 6.966,
      J: 0.153,
      K: 0.772,
      L: 4.025,
      M: 2.406,
      N: 6.749,
      O: 7.507,
      P: 1.929,
      Q: 0.095,
      R: 5.987,
      S: 6.327,
      T: 9.056,
      U: 2.758,
      V: 0.978,
      W: 2.36,
      X: 0.15,
      Y: 1.974,
      Z: 0.074
    };
  }

  function getFrequencies(column) {
    let freq = {};
    let colsize = 0.0;

    for (let i = 0; i < 26; i++)
      freq[String.fromCharCode(ascii("A") + i)] = 0.0;

    for (let ch = 0; ch < column.length; ch++) {
      freq[column[ch]] += 1;
      colsize += 1;
    }

    for (let key in freq) freq[key] = (freq[key] / colsize) * 100.0;

    return freq;
  }

  function getDeviationFromEnglish(frequencies) {
    let dev = 0.0;
    let normalFreq = englishFrequencies();
    let i = 0;
    //Would use a for loop but that kills the program.  Do research plz
    while (i < 26) {
      let key = String.fromCharCode(ascii("A") + i);
      dev += Math.abs(frequencies[key] - normalFreq[key]);
      i++;
    }
    return dev / 26.0;
  }

  function mostLikelyChar(deviations) {
    let lowestDeviation = 9999;
    lowestKey = "!";
    for (let key in deviations) {
      if (deviations[key] < lowestDeviation) {
        lowestDeviation = deviations[key];
        lowestKey = key;
      }
    }
    return lowestKey;
  }

  let FINAL_KEY = "";
  let ciphertext = cipherCode.replace(/[^a-zA-Z]/g, "").toUpperCase();
  let keyLength = getKeyLength(ciphertext);

  for (let columnNumber = 0; columnNumber < keyLength; columnNumber++) {
    let column = getColumn(ciphertext, columnNumber, keyLength);
    deviations = {};
    for (let char = 0; char < 26; char++) {
      let potentialKey = String.fromCharCode(ascii("A") + char);
      let decryptAttempt = decryptColumn(column, potentialKey);
      let decrFrequencies = getFrequencies(decryptAttempt);
      deviations[potentialKey] = getDeviationFromEnglish(decrFrequencies);
    }
    FINAL_KEY = FINAL_KEY + mostLikelyChar(deviations);
  }

  return FINAL_KEY;
}
