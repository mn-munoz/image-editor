import { readFileSync } from "node:fs";
import process from 'process';


interface Color {
    red : number;
    green : number;
    blue : number;
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
    console.log(args);
}

main();