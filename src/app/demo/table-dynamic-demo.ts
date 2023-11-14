import { ChangeDetectorRef, Component } from '@angular/core';
import { GroupedProduct, Product, cargoEvent } from '../../domain/product';
import { ProductService } from '../../service/productservice';
import jsPDF from 'jspdf';
import autoTable, { ColumnInput } from 'jspdf-autotable'

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'table-dynamic-demo',
  templateUrl: 'table-dynamic-demo.html',
})
export class TableDynamicDemo {
  products!: Product[];
  groupedProducts: GroupedProduct[];
  colsGroup!: Column[];
  cols!: Column[];

  eventData: cargoEvent[] = []; 
  eventCols: any[];

  sortableColumns = [
    'productName',
    'transportCompany',
    'registerNumber',
    'customer',
    'state',
    'sourceCollectionPoint.name',
    'targetCollectionPoint.name',
    'fetchCollectionPoint.name',
    'eventDate',
    'wasteOrigin',
  ];

  groupOptions = [
    { label: 'State', value: 'state' },
    { label: 'Product Name', value: 'productName' },
    { label: 'Category Name', value: 'categoryName' },
    { label: 'Contract Number', value: 'contractNumber' },
    { label: 'Waste Origin', value: 'wasteOrigin' },
  ];

  timeGroupOptions = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  selectedGroupOption: string = undefined;
  selectedTimeGroupOption: string;
  exportColumns: ColumnInput[];
  selectedEvents: cargoEvent[];
  productCountMap: Map<string, number> = new Map<string, number>();
  groupCountMap: Map<string, { count: number, value: any }>;


  constructor(private productService: ProductService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.productService.getProducts().then((data) => {
      this.products = data;
      this.products.forEach((product) => {
        this.setCodeInName(product);
      });
      this.groupedProducts = this.groupProductsByCode(this.products);
    });

    this.cols = [
      { field: 'customer', header: 'Asiakas' },
      { field: 'name', header: 'Kuljetusliike' },
      { field: 'category', header: 'Tyyppi' },
      { field: 'quantity', header: 'Mistä' },
      { field: 'quantity', header: 'Minne' },
      { field: 'quantity', header: 'Noutopaikka' },
      { field: 'price', header: 'Hinta' },
      { field: 'productName', header: 'Nimi' },
      { field: 'code', header: 'tuotekoodi' },
    ];
    this.colsGroup = [
      { field: 'code', header: 'tuotekoodi' },
      { field: 'totalRows', header: 'Yhteensä' },
    ];
    this.productService.getEventDataRows().then((data) => {
      console.log('getEventDataRows', data);
      this.eventData = [...data];
      this.groupedProducts = this.groupEventsByCode(this.eventData);
      this.productCountMap = new Map<string, number>();
      
      this.countEventPerGroup(this.eventData);
      this.groupByselectedGroup(this.eventData);
      console.log(this.groupCountMap);
    });

    this.eventCols = [
      { field: 'productName', header: 'Tuotteen nimi', sortable: true },
      { field: 'producCode', header: 'Tuotekoodi', sortable: true },
      { field: 'transportCompany', header: 'Kuljetusyritys', sortable: true },
      { field: 'registerNumber', header: 'Rekisterinumero', sortable: true },
      { field: 'customer', header: 'Asiakas', sortable: true },
      { field: 'state', header: 'Tila', sortable: true },
      {
        field: 'sourceCollectionPoint.name',
        header: 'Mistä',
        sortable: true,
      },
      {
        field: 'targetCollectionPoint.name',
        header: 'Minne',
        sortable: true,
      },
      { field: 'fetchCollectionPoint.name', header: 'Nouto', sortable: true },
      { field: 'eventDate', header: 'Tapahtumapäivä', sortable: true },
      { field: 'quantity', header: 'Määrä' },
      { field: 'weight', header: 'Paino (kg)' },
      { field: 'wasteOrigin', header: 'Alkuperä', sortable: true },
    ];
     this.exportColumns = this.eventCols.map((col) => ({
      header: col.header,
      dataKey: col.field,
    }));

  }
  setCodeInName(product: any): any {
    product.productName = product.code.substring(0, 3);
  }

  groupProductsByCode(products: Product[]): GroupedProduct[] {
    const groupedProducts: GroupedProduct[] = [];

    products.forEach((product) => {
      let group = groupedProducts.find(
        (group) => group.code === product.code
      );

      if (!group) {
        group = { code: product.code, products: [], totalRows: 0 };
        groupedProducts.push(group);
      } 
      group.products.push(product);
      group.totalRows++;
    });

    return groupedProducts;
  }

  groupEventsByCode(eventData: cargoEvent[]): GroupedProduct[] {
  
    eventData.forEach(event => {
      let group = this.groupedProducts.find(group => group.code === event.productCode);
      if (!group) {
        group = { code: event.productCode, products: [], totalRows: 0 };
        this.groupedProducts.push(group);
      }
      group.products.push(event);
      group.totalRows++;
    });
    return this.groupedProducts;
  }

  groupByselectedGroup(eventData: cargoEvent[]){
    this.groupCountMap = new Map<string, { count: number, value: any }>();
    let groupedEventData: { [key: string]: cargoEvent[] } = {};
  
    if (this.selectedGroupOption) {
      this.eventData.sort((a, b) => {
        if (a[this.selectedGroupOption] < b[this.selectedGroupOption]) {
          return -1;
        }
        if (a[this.selectedGroupOption] > b[this.selectedGroupOption]) {
          return 1;
        }
        return 0;
      });
      console.log(this.selectedGroupOption)
      this.eventData.forEach(event => {
        let groupKey = event[this.selectedGroupOption]; // this.selectedGroupOption is the selected option from the dropdown
        let groupData = this.groupCountMap.get(groupKey);
        if (!groupData) {
          groupData = { count: 0, value: groupKey };
          this.groupCountMap.set(groupKey, groupData);
          groupedEventData[groupKey] = [];
        }
        groupData.count++;
        groupedEventData[groupKey].push(event);
      });
    }
  
    console.log(groupedEventData); // This will log the grouped eventData
  
  }

  countEventPerGroup(eventData: cargoEvent[]) {
    eventData.forEach(event => {
      let count = this.productCountMap.get(event.productCode);
      if (!count) {
        count = 0;
      }
      this.productCountMap.set(event.productCode, count + 1);
    });
    return this.productCountMap;
  }


  onGroupOptionChange(event: any) {
    this.selectedGroupOption = event.value;
    this.groupByselectedGroup(this.eventData);
  }

  onTimeGroupOptionChange(event) {
    // Implement your time grouping logic here
  }

  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.eventData);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'products');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      let EXCEL_TYPE =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE,
      });
      FileSaver.saveAs(
        data,
        fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
      );
    });
  }

  // 
  exportPdf() {
/*     import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.autoTable(this.exportColumns, this.eventData);
        doc.save('products.pdf');
      });
    }); */
    // https://raw.githack.com/MrRio/jsPDF/master/docs/index.html
    // demos https://raw.githack.com/MrRio/jsPDF/master/index.html
    // https://www.npmjs.com/package/jspdf-autotable/v/3.0.0
    const doc = new jsPDF('l', 'mm', 'a4');
    // autoTable(doc, { html: '#dt' });
    autoTable(doc, {columns: this.exportColumns, body: this.eventData as any});

    doc.save('table.pdf')


  }
}
