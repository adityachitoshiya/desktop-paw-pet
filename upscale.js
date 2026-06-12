const fs = require('fs');

const CAT_BASE = [
  "                                  ",
  "          ##          ##          ",
  "         ####        ####         ",
  "        ######  ##  ######        ",
  "        ##################        ",
  "       ####################       ",
  "       #### YY      YY ####       ",
  "      ### YYYY #### YYYY ###      ",
  "  ####### Y##Y #### Y##Y #######  ",
  "    ##### Y##Y #### Y##Y #####    ",
  "  ## #### YYYY #### YYYY #### ##  ",
  " ##   ###### YY WW YY ######   ## ",
  "        ##################        ",
  "         ################         ",
  "          ##############          ",
  "           ############           ",
  "          ##############          ",
  "         ################         ",
  "        ##################        ",
  "       ####################       ",
  "      ######################      ",
  "     ########################     ",
  "     ########################     ",
  "     ########################     ",
  "      ######################      ",
  "        ##################        ",
  "          ##############          ",
  "                                  ",
];

let upscaled = [];

for (let y = 0; y < CAT_BASE.length; y++) {
  let row1 = "";
  let row2 = "";
  for (let x = 0; x < CAT_BASE[y].length; x++) {
    const char = CAT_BASE[y][x];
    row1 += char + char;
    row2 += char + char;
  }
  upscaled.push(row1);
  upscaled.push(row2);
}

// Write the upscaled version to a file so we can view it
fs.writeFileSync('upscaled_cat.txt', upscaled.join('\n'));
console.log("Upscaled to 68x56. Written to upscaled_cat.txt.");
