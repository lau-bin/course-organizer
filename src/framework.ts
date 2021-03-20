import { ReactNode } from "react"

export interface Component{

    start(): void
    stop(): void

}

export interface ServiceHolder{
    constructor(serviceBlob?: ServiceBlob):void
}

export type ServiceBlob = {}

export class Framework {

    static globaServices: any = {}

}

function jfor(times:number, func: (index?: number) => JSX.Element): Array<JSX.Element>{
    return( [...Array(times)].map((e, i) => func(i)));
}

function initArray(arr:any[], value:any){
    for (let i = 0; i < arr.length; i++){
        arr[i] = value;
    }
}
function createArray(length:number):Array<any> {
    var arr = new Array(length || 0),
        i = length;


    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        //@ts-ignore
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function download(filename:string, text:string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
export const util = {
    jfor,
    createArray,
    download
}
