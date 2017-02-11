import {Component, Pipe, Injectable, PipeTransform} from '@angular/core';
import {AngularFire, FirebaseListObservable} from 'angularfire2'
type estatusTarea = 'pendiente' | 'completa' | 'cancelada' | 'espera';

export interface ITarea {
    $key ?:any
    fecha: string
    titulo: string
    contenido: string
    estatus: estatusTarea
    tags: string[]
    fechaCompletada ?: string
    verContenido ?: boolean
}

@Pipe({
    name: 'filtroListado',
    pure: false
})
@Injectable()
export class FiltroListadoPipe implements PipeTransform {
    transform(items: any[], palabra: string): any {
        if(items==null){
            return null;
        }
        return items.filter(item => {
            if (!palabra)
                return true;
            return item.titulo.indexOf(palabra) !== -1 ||
                item.contenido.indexOf(palabra) !== -1;
        });
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    tareas: FirebaseListObservable<ITarea[]>;

    tareaSeleccionada: ITarea;

    constructor(af: AngularFire) {
        this.tareas = af.database.list("/tareas");
    }

    nuevaTarea() {
        let titulo = "";
        if (titulo = prompt("Nombre")) {
            this.tareas.push({
                fecha: 'hoy',
                titulo: titulo,
                contenido: "",
                estatus: "pendiente",
                tags: []
            });
        }
    }

    seleccionarTarea(tarea: ITarea) {
        this.tareaSeleccionada = tarea;
    }

    cambiarEstatus(estatus: estatusTarea, tarea : ITarea) {

        let nuevaInfo : any = {
            estatus : estatus
        };

        tarea.estatus = estatus;

        if (estatus == 'completa') {
            tarea.fechaCompletada = "Hoy";
            nuevaInfo.fechaCompletada = "Hoy";
        }

        this.tareas.update(tarea.$key,nuevaInfo);
    }

    actualizarContenido(tarea : ITarea){
        let nuevoContenido = {
            contenido:tarea.contenido
        };
        this.tareas.update(tarea.$key,nuevoContenido);
    }

    verContenido(tarea : ITarea){

        if (typeof tarea.verContenido == 'undefined') {
            tarea.verContenido = true;
            return;
        }

        tarea.verContenido = !tarea.verContenido;

    }
}
