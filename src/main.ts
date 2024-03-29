/* V A L U E S */

const CANVAS_MAX_WIDTH: number = 1080;
const CANVAS_MAX_HEIGHT: number = 1080;

const PIXEL_SIZE: number = 15;

const MAX_COLOR_DIST: number = 60;

let pixCount: number = 0;

class Color {
  rgbString: string;
  constructor(public r: number, public g: number, public b: number) {
    this.rgbString = `rgb(${r}, ${g}, ${b})`;
  }
}

class PaletteColor extends Color {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public index: number
  ) {
    super(r, g, b);
  }
}

let palette: PaletteColor[] = [];

// image info

let imageDirection: "landscape" | "portrait";
let imageWidth: number;
let imageHeight: number;

// colors

const lightModedefaultColor = "rgb(227, 227, 227)";
let colorFromImage =
  "linear-gradient(180deg, rgb(227,227,227) 0%, rgba(188,195,205) 100%)";

/* H T M L  E L E M E N T S */

/* drop area */
const dropArea: HTMLElement = document.querySelector(".drag-area");
const dragText: HTMLElement = dropArea.querySelector("#drag-and-drop-msg");

/* button area */
const browseButton: HTMLButtonElement = dropArea.querySelector(".browseButton");
const pixelateButton: HTMLButtonElement = document.querySelector(".pixelateButton");
const resetButton: HTMLButtonElement = document.querySelector(".resetButton");
const input: HTMLInputElement = dropArea.querySelector("input");

/* image area */
const imgArea: HTMLElement = document.querySelector(".image-area");

const imgCanvas: HTMLCanvasElement = document.createElement("canvas");
const imgContext: any = imgCanvas.getContext("2d");
imgArea.appendChild(imgCanvas);

const pixCanvas: HTMLCanvasElement = document.createElement("canvas");
const pixContext: any = pixCanvas.getContext("2d");

const resultCanvas: HTMLCanvasElement = document.createElement("canvas");
const resultContext: any = resultCanvas.getContext("2d");
imgArea.appendChild(resultCanvas);

const gridCanvas: HTMLCanvasElement = document.createElement("canvas");
const gridContext: any = gridCanvas.getContext("2d");
imgArea.appendChild(gridCanvas);

/* palette area */
const paletteArea: HTMLDivElement = document.querySelector(".palette-area");

/* C O M M A N D S */

/* D R A G , D R O P & B R O W S E  F I L E */

let imgFile: File;

browseButton.addEventListener("click", () => {
  input.click(); // if browseButton is clicked the input is also clicked
});

// when file is uploaded by clicking browse button
input.addEventListener("change", (e: Event): void => {
  const input = e.target as HTMLInputElement;
  // getting user select file and [0] means if a user selets multiple files we'll select only the first one
  imgFile = input.files[0];
  // ! if use this.files[0], "this" points to window because it is an arrow function
  showFile();
});

// if user drag file over image area
dropArea.addEventListener("dragover", (e: Event): void => showReleaseMsg(e));

// if user leave dragged file from image area
dropArea.addEventListener("dragleave", () => showUploadMsg());

// if user drop file on drag area
dropArea.addEventListener("drop", (e: any): void => {
  e.preventDefault(); // preventing from default behaviour (opening a new tab)
  // console.log("File is dropped on drop area");

  // getting user select file and [0] means if a user selets multiple files we'll select only the first one
  imgFile = e.dataTransfer.files[0];
  // console.log(imgFile);
  showFile();
});

/* G R I D */
gridCanvas.addEventListener("mouseover", () => {
  if (imageWidth !== undefined && imageHeight !== undefined) {
    // resizing canvas sizes

    gridCanvas.width = imageWidth;
    gridCanvas.height = imageHeight;

    gridContext.beginPath();
    for (let x = 0; x <= imageWidth; x += PIXEL_SIZE) {
      gridContext.moveTo(x, 0);
      gridContext.lineTo(x, imageHeight);
    }
    // set the color of the line
    gridContext.strokeStyle = "rgb(20,20,20)";
    gridContext.lineWidth = 1;
    // the stroke will actually paint the current path
    gridContext.stroke();
    // for the sake of the example 2nd path
    gridContext.beginPath();
    for (let y = 0; y <= imageHeight; y += PIXEL_SIZE) {
      gridContext.moveTo(0, y);
      gridContext.lineTo(imageWidth, y);
    }
    // set the color and width of the line
    gridContext.strokeStyle = "rgb(20,20,20)";
    gridContext.lineWidth = 1;
    // for your original question - you need to stroke only once
    gridContext.stroke();

    // show current pixel
  }
});

gridCanvas.addEventListener("mouseout", () => {
  gridContext.clearRect(0, 0, imageWidth, imageHeight);
});

/* R E S E T */

resetButton.addEventListener("click", () => {
  imgContext.clearRect(0, 0, CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT);
  pixContext.clearRect(0, 0, CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT);
  resultContext.clearRect(0, 0, CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT);
  gridContext.clearRect(0, 0, CANVAS_MAX_WIDTH, CANVAS_MAX_HEIGHT);
  imgFile = undefined;
  imageWidth = undefined;
  imageHeight = undefined;
  palette = [];
  dragText.innerHTML = "Drag & Drop to Upload Image";
  input.value = "";
  // imgCanvas.width = 0;
  // imgCanvas.height = 0;
  // pixCanvas.width = 0;
  // pixCanvas.height = 0;
  // resultCanvas.width = 0;
  // resultCanvas.height = 0;
  // gridCanvas.width = 0;
  // gridCanvas.height = 0;
  paletteArea.innerHTML = "";

  imgCanvas.style.width = `${600}px`;
  imgCanvas.style.height = `${600}px`;

  resultCanvas.style.width = `${600}px`;
  resultCanvas.style.height = `${600}px`;

  gridCanvas.style.width = `${600}px`;
  gridCanvas.style.height = `${600}px`;

  dropArea.classList.remove("hidden");
  
  document.body.style.background = lightModedefaultColor;
  pixelateButton.classList.remove("active");
  pixelateButton.style.background = "whitesmoke";
  pixCount = 0;
});

/* P I X A L A T E */

pixelateButton.addEventListener("click", () => {
  if (imageWidth !== undefined && imageHeight !== undefined && pixCount < 1) {
    // double-check if image is uploaded
    // TODO : consider deleting this console.log
    console.log("pix!");

    const pixelSize: number = PIXEL_SIZE;
    // TODO : only valid values e.g. 6, 9, 10, 12, ...
    const pixelNumCol: number = Math.floor(imageWidth / pixelSize);
    const pixelNumRow: number = Math.floor(imageHeight / pixelSize);
    const pixNum: number = pixelNumCol * pixelNumRow;

    // TODO : image resizing function & show current picture size
    /* 
    임의로 픽셀 크기를 정했을때 자투리 부분이 남는걸 방지하기위해 아예 리사이즈를 조금 해버리는게 어떨까?

    pixel size 180 => 6 * ? pixels
    pixel size 90 => 12  * ? pixels
    pixel size 45 => 24 * ? pixels
    pixel size 30 => 36 * ? pixels
    pixel size 24 => 45 * ? pixels
    pixel size 20 => 54 * ? pixels
    pixel size 15 => 72 * ? pixels
    pixel size 12 => 90 * ? pixels
    pixel size 10 => 108 * ? pixels
    pixel size 9 => 120  * ? pixels
    pixel size 6 => 180 * ? pixels
    */

    // creating an empty 2d matrix
    const pixMatrix: number[][] = [];

    for (let i = 0; i < pixelNumRow; i++) {
      pixMatrix.push([]);
    }

    // draw image on canvas
    pixCanvas.width = pixelNumCol;
    pixCanvas.height = pixelNumRow;

    pixContext.drawImage(imgCanvas, 0, 0, pixelNumCol, pixelNumRow);

    resultCanvas.width = imageWidth;
    resultCanvas.height = imageHeight;

    // background of the result
    resultContext.fillStyle = "whitesmoke";
    resultContext.fillRect(0, 0, imgCanvas.width, imgCanvas.height);

    /* getting pixelated data */
    const pixData = pixContext.getImageData(
      0,
      0,
      pixelNumCol,
      pixelNumRow
    ).data;

    // 비슷한 색깔 골라 팔레트, 2차원 배열 만들기
    for (let pixel = 0; pixel < pixNum; pixel++) {
      const col = pixel % pixelNumCol;
      const row = Math.floor(pixel / pixelNumCol);

      const r = pixData[pixel * 4 + 0];
      const g = pixData[pixel * 4 + 1];
      const b = pixData[pixel * 4 + 2];
      // const a = pixData[pixel * 4 + 3];

      // TODO : alpha value test
      // imgContext.globalAlpha = 0.8;

      let currentColor = new Color(r, g, b);

      // adding color in the palette if new
      // if it's the first color
      if (palette.length === 0) {
        const newPaletteColor = new PaletteColor(
          currentColor.r,
          currentColor.g,
          currentColor.b,
          palette.length
        );
        palette.push(newPaletteColor);

        pixMatrix[row].push(palette.length - 1);
      } else {
        const paletteLength = palette.length;
        let thereIsSimilarColor: boolean = false;
        let similarColorIdx: number = 0;

        for (let j = 0; j < paletteLength; j++) {
          const pr = palette[j].r;
          const pg = palette[j].g;
          const pb = palette[j].b;

          const cr = currentColor.r;
          const cg = currentColor.g;
          const cb = currentColor.b;

          const redDiff = cr - pr;
          const greenDiff = cg - pg;
          const blueDiff = cb - pb;

          /* Euclidean distance */
          // const colorDist = Math.sqrt(redDiff ** 2 + greenDiff ** 2 + blueDiff ** 2);

          /*
            a low-cost approximation algoritm getting color distance from rgb values 
            ! this is closer to the human perception of colors
            https://www.compuphase.com/cmetric.htm 
          */
          const redComp = (cr + pr) * 0.5;
          const colorDist = Math.sqrt(
            (2 + redComp / 256) * redDiff * redDiff +
              4 * greenDiff * greenDiff +
              (2 + (255 - redDiff) / 256) * blueDiff * blueDiff
          );

          if (colorDist < MAX_COLOR_DIST) {
            thereIsSimilarColor = true;
            similarColorIdx = j;
            break;
          } else {
            thereIsSimilarColor = false;
          }
        }
        if (!thereIsSimilarColor) {
          // there is no similar color
          const newPaletteColor = new PaletteColor(
            currentColor.r,
            currentColor.g,
            currentColor.b,
            palette.length
          );
          palette.push(newPaletteColor);
          pixMatrix[row].push(palette.length - 1);
        } else {
          // there is a similar color
          pixMatrix[row].push(similarColorIdx);
        }
      }
    }

    // TODO : 팔레트 뽑아냈으니 이제 다시 픽셀 순회하면서 각 자리에 맞는 색깔 넣어주기

    for (let row = 0; row < pixMatrix.length; row++) {
      for (let col = 0; col < pixMatrix[row].length; col++) {
        const x = col * pixelSize;
        const y = row * pixelSize;

        resultContext.save();
        resultContext.translate(x, y);
        resultContext.fillStyle = palette[pixMatrix[row][col]].rgbString;

        // ? Rectangle pixels
        resultContext.fillRect(0, 0, pixelSize, pixelSize);

        // ? Circle pixels
        // resultContext.translate(pixelSize * 0.5, pixelSize * 0.5);
        // resultContext.beginPath();
        // resultContext.arc(0, 0, pixelSize * 0.5, 0, Math.PI * 2);
        // resultContext.fill();

        resultContext.restore();
      }
    }
    showPalette();
    // console.log(palette);
    pixelateButton.classList.remove("active");
    pixelateButton.style.background = "whitesmoke";
    pixCount++;
  }
});

// function to
const showFile = () =>
  // fromImgFile: File,
  // toDivEl: HTMLDivElement,
  // toCanvasEl: HTMLCanvasElement
  {
    console.log("showFile");
    let fileType = imgFile.type;
    let validExtentsions: string[] = ["image/jpeg", "image/jpg", "image/png"];

    if (validExtentsions.includes(fileType)) {
      const originalImage: HTMLImageElement = new Image();

      let fileReader: FileReader = new FileReader();

      fileReader.readAsDataURL(imgFile);

      fileReader.onload = () => {
        activatePixelate(colorFromImage);

        let imageURL: string = `${fileReader.result}`;
        // console.log(imageURL); // this is a base64 format
        originalImage.src = imageURL;

        originalImage.addEventListener("load", () => {
          /* adjusting image size to the canvas size */
          imageWidth = originalImage.width;
          imageHeight = originalImage.height;
          const whRatio: number = imageWidth / imageHeight;
          if (whRatio >= 1) {
            /* width is bigger */
            imageDirection = "landscape";
            imageWidth = CANVAS_MAX_WIDTH;
            imageHeight = imageWidth / whRatio;
          } else {
            /* height is bigger */
            imageDirection = "portrait";
            imageHeight = CANVAS_MAX_HEIGHT;
            imageWidth = imageHeight * whRatio;
          }

          /* fitting canvas size to image size */
          imgCanvas.width = imageWidth;
          imgCanvas.height = imageHeight;

          /* fit canvas in screen */
          // TODO : 나중에 마진 값 확인하기 (진짜 1080 픽셀이 맞는지)
          const imageCSSWH = Number(
            window.getComputedStyle(imgCanvas).width.split("px")[0]
          );

          imgCanvas.style.width = `${Math.floor(
            (imageWidth * imageCSSWH) / CANVAS_MAX_WIDTH
          )}px`;
          imgCanvas.style.height = `${Math.floor(
            (imageHeight * imageCSSWH) / CANVAS_MAX_HEIGHT
          )}px`;

          resultCanvas.style.width = `${Math.floor(
            (imageWidth * imageCSSWH) / CANVAS_MAX_WIDTH
          )}px`;
          resultCanvas.style.height = `${Math.floor(
            (imageHeight * imageCSSWH) / CANVAS_MAX_HEIGHT
          )}px`;

          gridCanvas.style.width = `${Math.floor(
            (imageWidth * imageCSSWH) / CANVAS_MAX_WIDTH
          )}px`;
          gridCanvas.style.height = `${Math.floor(
            (imageHeight * imageCSSWH) / CANVAS_MAX_HEIGHT
          )}px`;

          /* drawing the image on canvas */
          imgContext.drawImage(originalImage, 0, 0, imageWidth, imageHeight);

          /* hide drop area */
          dropArea.classList.add("hidden");
        });
      };
    } else {
      alert("This is not a valid image file");
      dragText.textContent = "Drag & Drop to Upload File";
    }
  };

const showReleaseMsg = (event: any): void => {
  event.preventDefault(); // preventing from default behaviour
  // console.log("File is on drop area");
  dropArea.classList.add("active");
  dragText.textContent = "Release to upload file";
};

const showUploadMsg = (): void => {
  // console.log("File is outside from drop area");
  dropArea.classList.remove("active");
  dragText.textContent = "Drag & Drop to Upload File";
};

const showPalette = async (): Promise<void> => {
  const calculate = await import("./functions/calculate.js");

  const sortedPalette = palette.slice(0);

  // sort by brightness
  sortedPalette.sort((c1: Color, c2: Color) => {
    const c1Brightness = calculate.relativeBrightness(c1.r, c1.g, c1.b);
    const c2Brightness = calculate.relativeBrightness(c2.r, c2.g, c2.b);
    return c2Brightness - c1Brightness;
  });

  for (let i = 0; i < palette.length; i++) {
    const paletteItem = document.createElement("div");
    paletteItem.classList.add("item");
    paletteItem.style.background = sortedPalette[i].rgbString;
    paletteArea.appendChild(paletteItem);

    paletteItem.addEventListener("click", () => {});
  }
};

const activatePixelate = (color: string): void => {
  dropArea.classList.add("hidden");

  pixelateButton.classList.add("active");
  document.body.style.background = color;
  pixelateButton.style.background = color;
};
// 모듈임을 알려준다.
export {};
