import { readFileSync, writeFileSync } from "node:fs";
import process from 'process';


interface Color {
    red : number;
    green : number;
    blue : number;
}

function defineColor(red: number = 0, green: number = 0, blue: number = 0): Color {
    return { red, green, blue };
}

class Image {
    private pixels: Color[][];

    constructor(width: number, height: number) {
        this.pixels = Array.from({ length: width }, () => Array.from({ length: height }, () => defineColor()));
    }

    public getWidth(): number {
        return this.pixels.length;
    }

    public getHeight(): number {
        return this.pixels[0]?.length ?? 0;
    }

    public getPixel(x: number, y: number): Color {
        const color = this.pixels[x]?.[y];
        if (color === undefined) {
            throw new RangeError(`Pixel (${x}, ${y}) is out of bounds`);
        }
        return color;
    }

    public setPixel(x: number, y: number, color: Color): void {
        const column = this.pixels[x];
        if (column === undefined || y < 0 || y >= column.length) {
            throw new RangeError(`Pixel (${x}, ${y}) is out of bounds`);
        }
        column[y] = color;
    }
}

class ImageEditor {
    public run(args: string[]): void {

        try{
            if (args.length < 3) {
                this.usage();
                return;
            }
            
            const inputFile = args[0];
            const outputFile = args[1];
            const filter = args[2];

            if (inputFile === undefined || outputFile === undefined || filter === undefined) {
                this.usage();
                return;
            }

            const image = this.read(inputFile);
            
            if (filter === "grayscale" || filter === "greyscale") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.grayscale(image);
            } else if (filter === "invert") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.invert(image);
            } else if (filter === "emboss") {
                if (args.length !== 3) {
                    this.usage();
                    return;
                }
                this.emboss(image);
            } else if (filter === "motionblur") {
                if (args.length < 4) {
                    this.usage();
                    return;
                }

                let length = -1;
                try {
                    if (args[3] === undefined) {
                        this.usage();
                        return;
                    }
                    length = parseInt(args[3], 10);
                } catch (error) {
                    this.usage();
                    return;
                }
                if (length < 0) {
                    this.usage();
                    return;
                }
                this.motionblur(image, length);
            } else {
                this.usage();
                return;
            }

            this.write(outputFile, image);

        } catch (error) {
            console.error("Error: " + error);
        }

    }

    private usage(): void {
        console.log("USAGE: npm run start <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}")
    }

    private grayscale(image: Image): void {
        const width = image.getWidth();
        const height = image.getHeight();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const { red, green, blue } = image.getPixel(x, y);
                const grayValue = Math.floor((red + green + blue) / 3);
                image.setPixel(x, y, defineColor(grayValue, grayValue, grayValue))
            }
        }
    }

    private invert(image: Image): void {
        const width = image.getWidth();
        const height = image.getHeight();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const { red, green, blue } = image.getPixel(x, y);
                image.setPixel(x, y, defineColor(255 - red, 255 - green, 255 - blue));
            }
        }
    }

    private emboss(image: Image): void {
        const width = image.getWidth();
        const height = image.getHeight();

        for (let y = height - 1; y >= 0; y--) {
            for (let x = width - 1; x >= 0; x--) {
                const { red, green, blue } = image.getPixel(x, y);
                let diff = 0;
                if (x > 0 && y > 0) {
                    const { red: prevRed, green: prevGreen, blue: prevBlue } = image.getPixel(x - 1, y - 1);
                    
                    if (Math.abs(red - prevRed) > Math.abs(diff)) {
                        diff = red - prevRed;
                    }
                    if (Math.abs(green - prevGreen) > Math.abs(diff)) {
                        diff = Math.abs(green - prevGreen);
                    }
                    if (Math.abs(blue - prevBlue) > Math.abs(diff)) {
                        diff = Math.abs(blue - prevBlue);
                    }
                }

                let grayLevel = 128 + diff;
                grayLevel = Math.max(0, Math.min(grayLevel, 255));
                image.setPixel(x, y, defineColor(grayLevel, grayLevel, grayLevel));
            }
        }
    }

    private motionblur(image: Image, length: number): void {
        if (length < 1) {
            return;
        }
        
        const width = image.getWidth();
        const height = image.getHeight();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let { red, green, blue } = image.getPixel(x, y);

                let maxX = Math.min(x + length - 1, width - 1);
                for (let i = x + 1; i <= maxX; i++) {
                    const { red: tmpRed, green: tmpGreen, blue: tmpBlue } = image.getPixel(i, y);
                    red += tmpRed;
                    green += tmpGreen;
                    blue += tmpBlue;
                }

                let delta = maxX - x + 1;
                red = Math.floor(red / delta);
                green = Math.floor(green / delta);
                blue = Math.floor(blue / delta);
                image.setPixel(x, y, defineColor(red, green, blue));
            }
        }
    }

    private read(filePath: string): Image {
        const data = readFileSync(filePath, 'utf-8');
        const tokens = data.trim().split(/\s+/);
        let index = 0;

        index++;

        const width = Number(tokens[index++]);
        const height = Number(tokens[index++]);

        const image = new Image(width, height);

        index++;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const red = Number(tokens[index++]);
                const green = Number(tokens[index++]);
                const blue = Number(tokens[index++]);
                image.setPixel(x, y, defineColor(red, green, blue));
            }
        }

        return image;
    }

    private write(filePath: string, image: Image): void {
        const width = image.getWidth();
        const height = image.getHeight();
        const lines: string[] = ["P3", `${width} ${height}`, "255"];

        for (let y = 0; y < height; y++) {
            const rowValues: number[] = [];
            for (let x = 0; x < width; x++) {
                const { red, green, blue } = image.getPixel(x, y);
                rowValues.push(red, green, blue);
            }
            lines.push(rowValues.join(" "));
        }

        writeFileSync(filePath, lines.join("\n") + "\n", 'utf-8');
    }
}

function main(): void {
    const args: string[] = process.argv.slice(2);

    const imageEditor = new ImageEditor();
    imageEditor.run(args);
}

main();