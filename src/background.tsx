/**
 * ✅ TODOS:
 * • Unit Test
 * • Performance profiling
 */

import { util } from './framework';
import * as ReactDOM from "react-dom";
import React from "react";
import '@popperjs/core';
import 'resources/bootstrap/bootstrap.bundle';
import css from './index.scss';


chrome.browserAction.onClicked.addListener(
        ()=>{
            chrome.browserAction.setPopup(chrome.runtime.getURL("popup/schedule.html"))
        }
    );

window.courseOrganizer = {
    askRender
}

function askRender(element){
    ReactDOM.render<React.FC>(<Schedule />, element, undefined);
}

/*************Start component logic  */ 

const WEEKDAYS = 5;
var courseId = 0;
var courses:Array<Course> = [
    // {id:1,code:"K20134", date:[{day:0,end:5,start:0},{day:1,end:5,start:0}],name:"AGA",place:"CAMPUS"},
    // {id:2,code:"K20134", date:[{day:0,end:5,start:0}],name:"AGA",place:"CAMPUS"},
    // {id:3,code:"K12344", date:[{day:1,end:16,start:2}],name:"AM1",place:"CAMPUS"},
    // {id:4,code:"M25134", date:[{day:4,end:5,start:0}],name:"AM2",place:"CAMPUS"},
    // {id:5,code:"L20134", date:[{day:0,end:9,start:4}],name:"SO",place:"CAMPUS"},
    // {id:6,code:"K20134", date:[{day:5,end:5,start:0}],name:"FISICA1",place:"CAMPUS"},
    // {id:7,code:"K25604", date:[{day:0,end:5,start:0}],name:"AYED",place:"CAMPUS"},
    // {id:8,code:"M20134", date:[{day:0,end:5,start:0}],name:"MDISC",place:"CAMPUS"},
    // {id:9999,code:"K25604", date:[{day:0,end:5,start:0}],name:"AYED",place:"CAMPUS"}
]
var index = {val:0};
//@ts-ignore
var orderedCourses = util.createArray(6,21);
var courseNameMap = new Map();
var colorMap = new Map();
var colorStripeMap = new Map();
var colorIndex = 0;
var colors = [
    ["255","0","0"],
    ["255","64","0"],
    ["255","128","0"],
    ["255","191","0"],
    ["255","255","0"],
    ["191","255","0"],
    ["128","255","0"],
    ["64","255","0"],
    ["0","255","0"],
    ["0","255","64"],
    ["0","255","128"],
    ["0","255","128"],
    ["0","255","191"],
    ["0","255","255"],
    ["0","195","255"],
    ["0","128","255"],
    ["0","64","255"],
    ["0","0","255"],
    ["64","0","255"],
    ["128","0","255"],
    ["191","0","255"],
    ["255","0","255"],
    ["255","0","191"],
    ["255","0","128"],
    ["255","0","64"],
    ["255","0","0"]

];

interface Course{
    id:number,
    name: string,
    place: string,
    date: Array<{
        start: number,
        end: number,
        day: number
    }>,
    code: string
} 

interface CourseSelection extends Course{
    selected: boolean,
    color?: Array<string>,
    inConflict: number,
    mark?:number,
    refreshHook:Array<Function>
}
var displayedCourses: Array<Array<JSX.Element>> = [];
var refArray:Array<React.RefObject<HTMLElement>> = [];
var lastSubjectName = "";

function Schedule(){
    let inputTextCoursesRef = React.createRef<HTMLTextAreaElement>();
    let inputNameCoursesRef = React.createRef<HTMLInputElement>();
    const [unusedState, setState] = React.useState<Array<Array<JSX.Element>>>([]);
    const [subjectName, setImpNameState] = React.useState<string>(lastSubjectName);
   
    let freeTime = (style:any) => {
        return(<>
        <span style={style} className={`${css.recreo} ${css.li}`} key={index.val++} ></span>
    </>)}
    let hour = (style:any) => {
        return(<>
            <span style={style} className={`${css.li}`} key={index.val++}></span>
        </>)
    }
    let hourName = (name:string, style:any) => {
        return(<>
        <span style={style} className={`${css.hourName} ${css.li}`} key={index.val++}>{name}</span>
    </>)}
    
    let daySegment = (name:string, day:number, segment:number) =>{
        let extra = (9*segment);
        return(<>
            {hourName(name, {gridColumn:"1 / 100",gridRow:(1+extra) + "/" + (1+1+extra)})}
            {hour( {gridColumn:"1 / 100",gridRow:(2+extra) + "/" + (2+1+extra)})}
            {hour( {gridColumn:"1 / 100",gridRow:(3+extra) + "/" + (3+1+extra)})}
            {hour( {gridColumn:"1 / 100",gridRow:(4+extra) + "/" + (4+1+extra)})}
            {freeTime( {gridColumn:"1 / 100",gridRow:(5+extra) + "/" + (5+1+extra)})}
            {hour( {gridColumn:"1 / 100",gridRow:(6+extra) + "/" + (6+1+extra)})}
            {hour( {gridColumn:"1 / 100",gridRow:(7+extra) + "/" + (7+1+extra)})}
            {hour( {gridColumn:"1 / 100",gridRow:(8+extra) + "/" + (8+1+extra)})}
            {hour( {gridColumn:"1 / 100",gridRow:(9+extra) + "/" + (9+1+extra)})}
        </>)
    }
    
    let week = ()=> {
        let result:Array<any> = [];
        for (let day = 0; day <= WEEKDAYS; day++){
            result.push(
                <div className={`${css.day} ${css.ul}`} key={index.val++}>
                    {displayedCourses[day]}
                    {daySegment("Mañana", day, 0)}
                    {daySegment("Tarde", day, 1)}
                    {daySegment("Noche", day, 2)}
                </div>
            )
        }
        return result;
    }


    function orderCoursesByName(courses:Array<Course>){
        courses.forEach(course =>{
            let courseArr = courseNameMap.get(course.name);
            let selCourse = {...course,selected:false, ref:[], inConflict: 0, refreshHook:[]};
            if (!courseArr){
                courseNameMap.set(course.name, [selCourse]);
            }
            else{
                courseArr.push(selCourse);
            }
        })        
    }
    
     function resetSchedule(){
        colorIndex = 0;
        courses.length = 0;
        index = {val:0};
        //@ts-ignore
        orderedCourses = util.createArray(6,21);
        courseNameMap.clear();
        colorStripeMap.clear();
        colorMap.clear();
        displayedCourses.length = 0;
        refArray.length = 0;
        setState([]);
     }
     
     
     
     function getShedule(){
         let schedule = "";
         courseNameMap.forEach((courseArr)=>{
             courseArr.forEach(course=>{
                 if (course.selected){
                     schedule += 
     `Materia: ${course.name}
     Curso: ${course.code}
     
     `;
                 }
             })
         })
         util.download("MySchedule.txt", schedule);
     }
     
     //Order course in list by date
     function orderCourse(orderedCourseArr:Array<Array<CourseSelection>>, date: Course['date'][0], course: CourseSelection){    
         for (let i = date.start; i <= date.end; i++){
             if (!orderedCourseArr[i]){
                 orderedCourseArr[i] = [];
             }
             orderedCourseArr[i].push(course);
         }
     }
     //Find correct position of course in table
     function findCoursePosition(orderedCourseArr:Array<Array<CourseSelection>>, date:Course["date"][0]):number{
         //Get row with the most elements, used to calculate element indentation
         let higherRowLength = 0;
         for (let i = date.start; i <= date.end; i++){
             if (orderedCourseArr[i]){
                 let length = orderedCourseArr[i].length;
                 if (length > higherRowLength){
                     higherRowLength = length;
                 }
             }
         }
         return higherRowLength;
     
     
     }
     
     function gerCoursesJSX(day:number): JSX.Element[]{
         let domElements: Array<JSX.Element> = [];
         for (let aSubjectCourses of courseNameMap.values()){
             for (let i = 0; i < aSubjectCourses.length; i++){
                 aSubjectCourses[i].date.forEach(date => {
                     if (date.day == day){
                         //First find  column to add it and then add it to the ordered courses
                         let indentation = findCoursePosition(orderedCourses[day], date);
                         orderCourse(orderedCourses[day], date, aSubjectCourses[i]);
                         //Create the jsx element with the grid column and row set
                         let start = date.start +1;//Add 1 because row 0 is title
                         let end = date.end +1;
                         //Add extra rows (titles, free time)
                         if (start >= 4){
                             start++;
                             end++;
                         }
                         if (start < 4 && end >= 4){
                             end++;
                         }
                         if (start >= 9){
                             start++;
                             end++;
                         }
                         if (start < 9 && end >= 9){
                             end++;
                         }
                         if (start >= 13){
                             start++;
                             end++;
                         }
                         if (start < 13 && end >= 13){
                             end++;
                         }
                         if (start >= 18){
                             start++;
                             end++;
                         }
                         if (start < 18 && end >= 18){
                             end++;
                         }
                         if (start >= 22){
                             start++;
                             end++;
                         }
                         if (start < 22 && end >= 22){
                             end++;
                         }
                         
                         let col = (indentation+1) + "/" + (indentation+2);
                         let row = (start+1) + "/" + (end+2);
     
                         let stripeColor;
                         let background;
                         let color = getColor(aSubjectCourses[i].name);
                         if (aSubjectCourses[i].date.length > 1 ){
                             if (aSubjectCourses[i].color){
                                 stripeColor = aSubjectCourses[i].color;
                             }else{
                                 stripeColor = getColorForStripe(aSubjectCourses[i].name);
                                 aSubjectCourses[i].color = stripeColor;
                             }
                             background = `repeating-linear-gradient(
                                 -45deg,
                              
                                 rgba(${stripeColor[0]}, ${stripeColor[1]}, ${stripeColor[2]}, 0.75),
                                 rgba(${stripeColor[0]}, ${stripeColor[1]}, ${stripeColor[2]}, 0.75) 4px,
                                 rgba(0, 0, 0, 0.75) 0px,
                                 rgba(0, 0, 0, 0.75) 20px
                               ),rgba(${color[0]},${color[1]},${color[2]}, 0.75)`;
                         }else{
                             background = `rgba(${color[0]},${color[1]},${color[2]}, 0.75)`;
                         }
    
                         const style = {
                             gridRow:row,
                             gridColumn:col,
                             background: background
                         }
                         console.log(background)

                     domElements.push(<CourseElement callback={toggleSelectionCallback} color={color} course={aSubjectCourses[i]} styles={style} selected={false} >
                         <p className={css.courseData}>{aSubjectCourses[i].name.toUpperCase()}</p>
                         <p className={css.courseData}>{aSubjectCourses[i].place}</p>
                         <p className={css.courseData}>{aSubjectCourses[i].code}</p>
                         </CourseElement>);
                         }
                 })
             }
         }
         React.createElement
         return domElements;
     }
  
     function getColor(name:string):Array<string>{
         let color = colorMap.get(name);
         if (color){
             return color;
         }else{
            if (colorIndex == colors.length){
                let err = "Error 🤓Too many courses";
                
                throw err; 
             }
             color = colors[colorIndex++];
             if (color){
                 colorMap.set(name, color)
                 return color;
             }else{
                let err = "Error 🤓Too many courses";
                
                throw err; 
             }
         }
     }
     function areColorsEqual(color1:string[], color2:string[]){
         if (color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2]){
             return true;
         }else{
             return false;
         }
     }
     function getColorForStripe(name:string):Array<string>{
         //All colors that we cant use
         let stripeColor = colorStripeMap.get(name);
         let courseColor = colorMap.get(name);
     
         let choosedColor;
         let i = -1;
         while (!choosedColor && ++i < colors.length){
             if ((!courseColor || !areColorsEqual(courseColor, colors[i])) && (!stripeColor || !stripeColor.find(value => areColorsEqual(value, colors[i])))){
                 choosedColor = colors[i];
             }
         }
     
         if (choosedColor){
             if (stripeColor){
                 stripeColor.push(choosedColor);
             }else{
                 colorStripeMap.set(name, [choosedColor]);
             }
             return choosedColor;
         }else{
            let err = "Error 🤓Too many courses";
            
            throw err; 
         }
     
     }

    function handleClickScan(){
        let scannedCourses;
        try{
            let label = inputNameCoursesRef.current;
            let element = inputTextCoursesRef.current;
            if (element && label){
                let name = label.value.trim();
                scannedCourses = scanCourses(name, element.value)
                //Reset courses input
                element.value = "";
            }
        }catch(e){
            let err = "☠️ Error parsing courses: " + e;
            
            throw err; 
        }

        setComponentState(scannedCourses);
    }

    function setComponentState(courses:Array<Course>){
        //Order courses by name
        orderCoursesByName(courses);
        for (let i = 0; i <= WEEKDAYS; i++){
            displayedCourses[i] = gerCoursesJSX(i);
        }
        setState([]);
    }


    function scanCourses(name:string, inputCourses:string):Array<Course>{
        let newCourses:Array<Course> = [];
       
        inputCourses.split('\n').forEach(line =>{
            let parts = line.split(' ');
            parts = parts.map(part=>part.replace(" ", "").replace('\t', "")).filter(part=>part !== "");
            let code = parts[0];
            let campus = parts[parts.length-1];
            let parsedDate:Course["date"] = [];
            let date:Array<string> = [];
            if (parts.length > 2){
                for (let i = 1; i < parts.length-1; i++){
                    date.push(parts[i]);
                }
            }
            date.forEach(date=>{
                //Get Day
                let text = date.substr(0,2).toLowerCase();
                let day;
                let start;
                let end;
                switch(text){
                    case "lu":
                        day = 0;
                        break;
                    case "ma":
                        day = 1;
                        break;  
                    case "mi":
                        day = 2;
                        break; 
                    case "ju":
                        day = 3;
                        break;
                    case "vi":
                        day = 4;
                        break;
                    case "sá":
                        day = 5;
                        break;
                    default:
                        throw text;
                
                }
                start = Number.parseInt(date.substr(5,1));
                end = Number.parseInt(date.substr(7,1));
                text = date.substr(3,1).toLowerCase();
                switch(text){
                    case "t":
                        start += 7;
                        end += 7;
                        break;  
                    case "n":
                        start += 14;
                        end += 14;
                        break; 
                
                }
                parsedDate.push({day:day,end:end,start:start});
            })

            newCourses.push({code:code,name:name,place:campus,date:parsedDate,id:courseId++});
        })

        return newCourses;
    }


    function setConflictingCourses(course:CourseSelection){
        let mark = Date.now();
        for (let i1 = 0; i1 < course.date.length; i1++){
            let date = course.date[i1];
            for (let i2 = date.start; i2 <= date.end; i2++){
                orderedCourses[date.day][i2].forEach(conflCourse =>{
                    set(conflCourse);
                })
            }
        }

        let subjectMap = courseNameMap.get(course.name);
        subjectMap.forEach(aCourse => {
            if (aCourse != course){
                set(aCourse);
            }
        });
        function set(conflCourse){
            //Since i span the same courses over all hours they accopy, they are repeated, this condition make sure we dont affect them multiple times
            if (conflCourse != course && (!conflCourse.mark || conflCourse.mark < mark)){
                conflCourse.mark = mark+1;
                if (!conflCourse.inConflict){
                    conflCourse.refreshHook.forEach(hook => hook(CallbackType.InConflict));
                }
                conflCourse.inConflict++; 
            }
        }
    }

    


    function unSetConflictingCourses(course:CourseSelection){
        let mark = Date.now();
        for (let i1 = 0; i1 < course.date.length; i1++){
            let date = course.date[i1];
            for (let i2 = date.start; i2 <= date.end; i2++){
                orderedCourses[date.day][i2].forEach(conflCourse =>{
                    unset(conflCourse);
                })
            }
        }
        let subjectMap = courseNameMap.get(course.name);
        subjectMap.forEach(aCourse => {
            if (aCourse != course){
                unset(aCourse);
            }
        });

        function unset(conflCourse){
            //Since i span the same courses over all hours they accopy, they are repeated, this condition make sure we dont affect them multiple times
            if (conflCourse != course && (!conflCourse.mark || conflCourse.mark < mark)){
                conflCourse.mark = mark+1;
                conflCourse.inConflict--; 
                if (!conflCourse.inConflict){
                    conflCourse.refreshHook.forEach(hook => hook(CallbackType.NotInConflict));
                }
            }
        }
    }

    function toggleSelectionCallback(course:CourseSelection){
        if (course.selected){
            setConflictingCourses(course);
        }else{
            unSetConflictingCourses(course);
        }
    }

    
    return(
    <div>
        <div className={css.container}>        
            {week()}
        </div>
        <div className={css.management}>
            
        <div>{/* Unable to verticall align the buttons 🤔 */}
            <div className="flex-column">
                <button onClick={getShedule} type="button" className={`align-self-start ${css.buttonElem} btn btn-primary`}>Get My Schedule</button>
                <button onClick={resetSchedule} type="button" className={`align-self-end ${css.buttonElem} btn btn-primary`}>Reset</button>
            </div>
        </div>
            <div className={`${css.cardElement} card`}>
                <div className="card-header">Scan courses</div>
    <input placeholder="Name" ref={inputNameCoursesRef} className="rounded" value={subjectName} onChange={e=>{setImpNameState(e.target.value);lastSubjectName = e.target.value}}></input>
                <textarea ref={inputTextCoursesRef} cols={40} className={`${css.textScanner} rounded`}></textarea>
                <button onClick={handleClickScan} type="submit" className="btn btn-primary">Scan</button>
            </div>
        </div>
    </div>
    );
}
const enum CallbackType{
    Select,
    Unselect,
    InConflict,
    NotInConflict
}


class CourseElement extends React.Component<any, {style:any}>{
    
    selected:boolean;
    color:Array<string>;
    styles:any;
    children:any;
    course:CourseSelection;
    medium:Function;
    toggleSelectionCallback:Function;


    constructor(props){
        super(props);
        this.selected = props.selected;//Need it?
        this.color = props.color;
        this.children = props.children;
        this.course = props.course;
        this.medium = props.medium;
        this.toggleSelectionCallback = props.callback;

        this.state = {style:{...props.styles}};

        this.course.refreshHook.push(this.refreshHook.bind(this));
    }  
    
    refreshHook(action:CallbackType){
        if (action == CallbackType.InConflict){       
            this.applyConflictedEffect();
        }else if (action == CallbackType.NotInConflict){
            this.clearConflictedEffect();
        }else if (action == CallbackType.Select){
            this.applySelectedEffect();
        } else if (action == CallbackType.Unselect){
            this.clearSelectedEffects();
        }
    }

    render(){
        return(
            <span style={this.state.style} className={`${css.course}`} key={index.val++} onClick={e => this.handleClick()}>
                {this.children}
                </span>
            );
    }

    componentDidMount(){

        if (this.course.selected){
            this.applySelectedEffect();
        }
        if (this.course.inConflict){
            this.applyConflictedEffect();
        }
    }
    handleClick(){
        if (this.course.inConflict){
            return;
        }
        if (this.course.selected){
            this.course.refreshHook.forEach(hook => hook(CallbackType.Unselect));
            this.course.selected = false;
            //Make conflicting courses ok again
            this.toggleSelectionCallback(this.course);
        }else{
            this.course.refreshHook.forEach(hook => hook(CallbackType.Select));
            //Select course
            this.course.selected = true;
        
            //Make conflicting courses greyed out
            this.toggleSelectionCallback(this.course);
        }

    }
   
    applySelectedEffect(){
        this.setState({
            style:{
                ...this.state.style,
                boxShadow: "0px 0px 5px 3px #0ff",
                position: "relative",
                zIndex: "1"
            }
        });
    }
    
    applyConflictedEffect(){
        this.setState({
            style:{
                ...this.state.style,
                backgroundColor: "gray"
            }
        });
    }

    clearSelectedEffects(){
        this.setState({
            style:{
                ...this.state.style,
                boxShadow: "none",
                position: "",
                zIndex: ""
            }
        });
    }
    clearConflictedEffect(){
        this.setState({
            style:{
                ...this.state.style,
                backgroundColor: `rgb(${this.color[0]},${this.color[1]},${this.color[2]})`
            }
        });
    }
}
