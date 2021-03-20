declare namespace IndexScssNamespace {
  export interface IIndexScss {
    buttonElem: string;
    cardElement: string;
    container: string;
    course: string;
    day: string;
    hourName: string;
    li: string;
    management: string;
    recreo: string;
    textScanner: string;
    ul: string;
  }
}

declare const IndexScssModule: IndexScssNamespace.IIndexScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IndexScssNamespace.IIndexScss;
};

export = IndexScssModule;
