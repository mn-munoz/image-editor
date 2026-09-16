import { readFileSync } from "node:fs";
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

            if (filter === "grayscale" || filter === "greyscale") {
            } else if (filter === "invert") {
            } else if (filter === "emboss") {
            } else if (filter === "motionblur") {
                if (args.length < 4) {
                    this.usage();
                    return;
                }
            } else {
                this.usage();
                return;
            }
        } catch (error) {
            console.error("Error: " + error);
        }

    }

    private usage(): void {
        console.log("USAGE: java ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}")
    }
}

function main(): void {
    const args: string[] = process.argv.slice(2);
    const imageEditor = new ImageEditor();
    imageEditor.run(args);
}

main();