import {Component, Pipe, Injectable, PipeTransform} from '@angular/core';
import {AngularFire, FirebaseListObservable, AuthProviders, AuthMethods} from 'angularfire2'
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
    carpeta : string
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
    palabraBuscar : string;
    user = {};

    tareaSeleccionada: ITarea;

    constructor(private af: AngularFire) {

        this.af.auth.subscribe(user => {
            if(user) {
                // user logged in
                this.user = user;
                this.tareas = this.af.database.list("/tareas",{
                    query: {
                        orderByChild: 'carpeta',
                        equalTo: 'inbox'
                    }
                });
            }
            else {
                // user not logged in
                this.user = {};
            }
        });
    }

    login() {
        this.af.auth.login({
            provider: AuthProviders.Google,
            method: AuthMethods.Popup
        });
    }

    logout() {
        this.af.auth.logout();
    }

    nuevaTarea() {
        this.tareas.push({
            fecha: 'hoy',
            titulo: this.palabraBuscar,
            contenido: "",
            estatus: "pendiente",
            carpeta : "inbox",
            tags: []
        });
        this.palabraBuscar = "";
    }

    /*seleccionarTarea(tarea: ITarea) {
        this.tareaSeleccionada = tarea;
    }*/

    cambiarEstatus(estatus: estatusTarea, tarea : ITarea) {

        let nuevaInfo : any = {
            estatus : estatus
        };

        // tarea.estatus = estatus;

        if (estatus == 'completa') {
            // tarea.fechaCompletada = "Hoy";
            nuevaInfo.fechaCompletada = "Hoy";
        }

        this.tareas.update(tarea.$key,nuevaInfo);
    }

    actualizarContenido(tarea : ITarea){
        let nuevoContenido = {
            contenido : tarea.contenido,
            verContenido : true
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

    cambiarCarpeta(carpeta : string,tarea : ITarea){
        let actualizar = {
            carpeta:carpeta
        };
        this.tareas.update(tarea.$key,actualizar);
        // tarea.carpeta = carpeta;
    }

    eliminarTarea(tarea : ITarea){
        if(confirm("Eliminar tarea?")){
            this.tareas.remove(tarea.$key);
        }
    }
}
