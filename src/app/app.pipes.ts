import { Pipe } from '@angular/core';
import {ITarea, IParametrosOrdenacion} from "./app.component";

@Pipe({name: "ordenarListado"})
export class OrdenarListadoPipe {
    transform(items: ITarea[] = null, parametrosOrdenacion: IParametrosOrdenacion): ITarea[] {

        if(!items)
            return [];

        items.sort((a: ITarea, b: ITarea) => {
            return 0;
            /*
            switch (sortBy) {
                case 'estatus':
                    let estatusTareas = ['pendiente','completada','cancelada','espera'];
                    if (estatusTareas.indexOf(a.estatus) < estatusTareas.indexOf(b.estatus)){
                        return -1;
                    }else if(estatusTareas.indexOf(a.estatus) > estatusTareas.indexOf(b.estatus)){
                        return 1;
                    }else{
                        return 0;
                    }
                default:
                    return 0;
            }
            */
        });
        return items;
    }
}