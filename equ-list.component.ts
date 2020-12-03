import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ExportModel } from './../class/export-model';
import { FilterColumnPipe } from './../pipe/filter-column.pipe';
import { SearchPipe } from './../pipe/search.pipe';
import { ConditionalFormattingDialogComponent } from './../dialog/conditional-formatting-dialog/conditional-formatting-dialog.component';
import { FilterDialogComponent } from './../dialog/filter-dialog/filter-dialog.component';
import { FieldDialogComponent } from './../dialog/field-dialog/field-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, Renderer2,HostListener }from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-equ-list',
  templateUrl:'./equ-list.component.html',
  styleUrls:['./equ-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers:[SearchPipe,FilterColumnPipe,ExportModel]
})
export class EquListComponent implements OnInit {
  items;elem;el;
  columns;
  searchString = "";
  conditionalformat = [];
  tabularlayout = true;
  chartsType = ['Bar', 'Pie','Line','Doughnut'];
  chart = 'Bar';
  exportsType=['PDF','EXCEL','CSV','JSON'];
  export='PDF';
  fileName= 'pivot_excel.xlsx';
  applyCond=true;
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  }
  @ViewChild(CdkVirtualScrollViewport, { static: false }) public viewPort: CdkVirtualScrollViewport;
  @ViewChild('fs',{static: false}) fs: ElementRef;
  isFullScreen=false;
  print=false;
  public get inverseTranslation(): string {
    if (!this.viewPort || !this.viewPort["_renderedContentOffset"]) {
      return "-0px";
    }
    let offset = this.viewPort["_renderedContentOffset"];
    return `-${offset}px`;
  }
  constructor(private httpService: HttpClient, public dialog: MatDialog,
    iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
    private renderer:Renderer2,private exportModel:ExportModel) {
    iconRegistry.addSvgIcon(
      'arrow-up',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_drop_up-24px.svg'));
    iconRegistry.addSvgIcon(
      'arrow-down',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow_drop_down-24px.svg'));
    iconRegistry.addSvgIcon(
      'filter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/filter_alt-24px.svg'));
  }
 
   
    
    


   



  ngOnInit()
   {
    this.items = this.httpService.get('./assets/assetData.json').subscribe(data => {
      this.items = data;
      this.columns = Object.keys(data[0]).map(data => {
        return {
          name: data, asc: 0, checked: true, filter: {
            status: false,
            option: '',
            value: ''
          },
          datatype: this.getType(this.items[0][data])
        };
      });
      console.log(this.items);

    });
   
    this.elem = document.documentElement;

  }
  
@HostListener('document:keydown.escape',["$event"]) onkeydownHandler(
  event:KeyboardEvent){
    this.renderer.removeClass(this.fs.nativeElement,'f-screen')
    this.isFullScreen=false;
  }




 
  
 


  


  openFullScreen() {
   
    
  
    console.log(this.fs)
    this.renderer.addClass(this.fs.nativeElement,'f-screen')
    this.isFullScreen=true;
    
    this.el=this.fs.nativeElement;
      if (this.el.requestFullscreen) {
        this.el.requestFullscreen();
      } else if (this.el.mozRequestFullScreen) {
        this.el.mozRequestFullScreen();
      } else if (this.el.webkitRequestFullscreen) {
        this.el.webkitRequestFullscreen();
      } else if (this.el.msRequestFullscreen) {

        this.el.msRequestFullscreen();
      }
      
      
    // }
  }
  
  closeFullScreen() {
   
    
  
    console.log(this.fs)
    this.renderer.removeClass(this.fs.nativeElement,'f-screen')
    this.isFullScreen=false;
    
    this.el=this.fs.nativeElement;
      if (this.el.exitFullscreen) {
        this.el.exittFullscreen();
      } else if (this.el.mozCancelFullScreen) {
        this.el.mozCancelFullScreen();
      } else if (this.el.webkitExitFullscreen) {
        this.el.webkitExitFullscreen();
      } else if (this.el.msExitFullscreen) {

        this.el.msExitFullscreen();
      }
      
      
    // }
  }

  getType(val) {
    if (typeof (val) == 'number') {
      return typeof (val);
    } else {
      if (val.match(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/)) {
        return 'date';
      } else {
        return typeof (val);
      }
    }
  }

  filterItems(col) {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      width: '50%',
      height: '50%',
      data: { columns: this.columns, index: col },
      disableClose: true
    });

  }

  openConditionalFormattingDialog() {
    this.applyCond=false;
    const dialogRef = this.dialog.open(ConditionalFormattingDialogComponent, {
      width: '70%',
      data: { columns: this.columns, format: this.conditionalformat},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        console.log(result);
        this.conditionalformat = [...result];
       this.applyCond=true;
      }
    });
  }
  getStyle(name, value) {
   // console.log(this.conditionalformat);
   //if(this.applyCond){
    if (this.conditionalformat.length == 0) {
      return {
        backgroundColor: 'white'
      }
    } else {
      let styleProperty = {
        backgroundColor: 'white',
        fontFamily: 'Arial',
        color:'black'
      };
      this.conditionalformat.forEach(data => {
        if (data.column == name) {
          let check = this.styleCheck(data.operator, data.value, value)
          if (check) {
            styleProperty.backgroundColor = data.color;
            styleProperty.fontFamily = data.font;
            styleProperty.color = data.tcolor;

          }
        }
      })
      return styleProperty;
   // }
  }
}


  styleCheck(option, value, item): boolean {
    if (option == 'Empty') {
      if (item == null || item == undefined || item == '') {
        return false;
      }
    }
    if (item == null || item == undefined) {
      return false;
    }
    switch (option) {
      case 'Equal':
        if (value == item) {
          return true
        }
        break;
      case 'Not equal':
        if (value != item) {
          return true;
        }
        break;
      case 'Less':
        if (item < value) {
          return true;
        }
        break;
      case 'Greater':
        if (item > value) {
          return true;
        }
        break;
      case 'Less or Equal':
        if (item <= value) {
          return true;
        }
        break;
      case 'Greater or equal':
        if (item >= value) {
          return true;
        }
        break;
    }
    return false;
  }

  changeOrder(col) {
    console.log(col);
    let colname = this.columns[col].name;
    console.log(colname);
    let newitem = [...this.items];
    console.log(newitem);
    if (this.columns[col].asc == 0) {
      this.items = newitem.sort((a, b) => {
        return (a[colname] > b[colname]) ? 1 : (b[colname] > a[colname]) ? -1 : 0;
      });
      this.columns[col].asc = 1;
    } else {
      this.items = newitem.sort((a, b) => {
        return (a[colname] > b[colname]) ? -1 : (b[colname] > a[colname]) ? 1 : 0;
      });
      this.columns[col].asc = 0;
    }
  }

  openFieldDialog() {
    const dialogRef = this.dialog.open(FieldDialogComponent, {
      width: '50%',
      height: '70%',
      data: { columns: this.columns, items: this.items },
      disableClose: true
    });
  }
  changeViewMode(chart) {
    if (chart) {
      this.tabularlayout = false;
    } else {
      this.tabularlayout = true;
      chart = chart;
    }
    this.chart=chart;
  }
  changeExportMode(exp) {

  switch(exp){
    case 'PDF':
      this.createPDF(); break;
    case 'EXCEL':
      this.createEXCEL();break;
    case 'CSV':
      this.createCSV();break;
    case 'JSON':
      this.createJSON();break;
  }
  }
  createPDF(){
    this.exportModel.exportToPDF(this.items,this.columns,this.searchString);
  }
  createEXCEL(){

       /* table id is passed over here */
       let element = document.getElementById('tabled');
       const ws: XLSX.WorkSheet =XLSX.utils.aoa_to_sheet(this.exportModel.finallistToExportAOA(this.items,this.columns,this.searchString));

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, this.fileName);


    }
  createCSV(){
    this.exportModel.exportToCSV(this.items,this.columns,this.searchString);
  }
  createJSON(){
    this.exportModel.exportToJSON(this.items,this.columns,this.searchString);
}

}

