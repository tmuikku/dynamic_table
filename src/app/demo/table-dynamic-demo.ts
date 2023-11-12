import { Component } from '@angular/core';
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

  eventData: cargoEvent[] = []; // Replace this with the data generated in the previous answer
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

  selectedGroupOption: string;
  selectedTimeGroupOption: string;
  exportColumns: ColumnInput[];
  selectedEvents: cargoEvent[];

  constructor(private productService: ProductService) {}

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
    });

    this.eventCols = [
      { field: 'productName', header: 'Tuotteen nimi', sortable: true },
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
      const existingGroup = groupedProducts.find(
        (group) => group.code === product.code
      );

      if (existingGroup) {
        existingGroup.products.push(product);
        existingGroup.totalRows++;
      } else {
        groupedProducts.push({
          code: product.code,
          products: [product],
          totalRows: 1,
        });
      }
    });

    return groupedProducts;
  }

  onGroupOptionChange(event: any) {
    this.selectedGroupOption = event.value;
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
