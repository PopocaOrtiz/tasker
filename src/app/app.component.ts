import {Component, Pipe, Injectable, PipeTransform} from '@angular/core';
import {AngularFire, FirebaseListObservable, AuthProviders, AuthMethods} from 'angularfire2'
// import { HotkeysService, Hotkey } from 'angular2-hotkeys';

type estatusTarea = 'pendiente' | 'completada' | 'cancelada' | 'espera';

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
    persona : string
}

export interface IPersona {
    $key ?: any
    nombre: string
    color : string
}

export interface IProyecto {
    $key ?: any
    nombre: string
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
            return item.titulo.toLowerCase().indexOf(palabra) !== -1 ||
                item.contenido.toLowerCase().indexOf(palabra) !== -1;
        });
    }
}

@Pipe({
    name: 'filtroProyecto',
    pure: false
})
@Injectable()
export class FiltroProyectoPipe implements PipeTransform {
    transform(items: any[], proyecto: string): any {
        if(items==null){
            return null;
        }
        return items.filter(item => {

            if (!proyecto)
                return true;

            return item.proyecto.indexOf(proyecto) !== -1;
        });
    }
}

@Pipe({
    name: 'separarTituloContenido',
    pure: false
})
@Injectable()
export class SepararTituloContenidoPipe implements PipeTransform {
    transform(contenido : string, separar : string): any {
        let partesContenido : string[] = contenido.split("\n");
        if (separar=='titulo') {
            return partesContenido[0];
        } else {
            if(partesContenido.length>1){
                partesContenido.shift();
                return partesContenido.join("\n");
            }
        }
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    tareas: FirebaseListObservable<ITarea[]>;
    personas: FirebaseListObservable<IPersona[]>;
    proyectos: FirebaseListObservable<IProyecto[]>;
    palabraBuscar : string;
    palabraBuscarPersona : string;
    palabraBuscarProyecto : string;
    user = {};

    tareaSeleccionada: ITarea;
    opcionSeleccionada : string;
    proyectoSeleccionado : IProyecto = {
        nombre : ''
    };

    verMenu : boolean = true;

    //,private hotkeysService: HotkeysService

    toggleSidebar(){
        this.verMenu = !this.verMenu;
    }
    constructor(private af: AngularFire) {
        this.af.auth.subscribe(user => {
            if (user) {
                // user logged in
                this.user = user;
                this.tareas = this.af.database.list("/tareas", {
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
        this.opcionSeleccionada = "inbox";

        this.personas = this.af.database.list("/personas");
        this.proyectos = this.af.database.list("/proyectos");

        /*this.hotkeysService.add(new Hotkey('meta', (event: KeyboardEvent): boolean => {
            console.log('Typed hotkey',event);
            return false; // Prevent bubbling
        }));*/
    }

    teclaControlActivada = false;

    hotKey(event){
        console.log("Key",event);
        if (event.keyCode == 17){
            if (event.type=='keydown') {
                this.teclaControlActivada = true;
            } else if (event.type=='keyup') {
                this.teclaControlActivada = false;
            }
        }
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

        if(!this.proyectoSeleccionado.nombre.length){
            alert("Selecciona un proyecto");
            return;
        }

        let f = new Date();
        let fecha = "";
        fecha += f.getFullYear() + "-";
        fecha += f.getMonth() + "-";
        fecha += f.getDay();

        this.tareas.push({
            fecha: 'hoy',
            titulo: this.palabraBuscar,
            fechaCreada : fecha,
            contenido: "Contenido de la tarea",
            estatus: "pendiente",
            carpeta : "inbox",
            proyecto : this.proyectoSeleccionado.nombre,
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

        if (estatus == 'completada') {
            // tarea.fechaCompletada = "Hoy";
            //nuevaInfo.fechaCompletada = "Hoy";

            let f = new Date();
            let fecha = "";
            fecha += f.getFullYear() + " ";
            fecha += f.getMonth() + " ";
            fecha += f.getDay();

            nuevaInfo.fechaCompletada = fecha;
        }

        this.tareas.update(tarea.$key,nuevaInfo);
    }

    seleccionarPersonaTarea(tarea : ITarea, persona : IPersona){
        let nuevaInfo : any = {
            persona : persona.nombre,
            color : persona.color
        };
        this.tareas.update(tarea.$key,nuevaInfo);
    }
    actualizarPersonaSolicitaTarea(tarea : ITarea, persona : IPersona){
        let nuevaInfo : any = {
            solicita : persona.nombre
        };
        this.tareas.update(tarea.$key,nuevaInfo);
    }

    actualizarContenido(tarea : ITarea){
        let nuevoContenido = {
            contenido : tarea.contenido
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

    verOpcion(carpeta : string){
        this.opcionSeleccionada = carpeta;
        switch (carpeta) {
            case 'inbox':
                this.tareas = this.af.database.list("/tareas",{
                    query: {
                        orderByChild: 'carpeta',
                        equalTo: 'inbox'
                    }
                });
                break;
            case 'todas':
                this.tareas = this.af.database.list("/tareas");
                break;
            case 'personas':

                break
        }
    }

    eliminarTarea(tarea : ITarea){
        if(confirm("Eliminar tarea?")){
            this.tareas.remove(tarea.$key);
        }
    }

    /** personas **/
    nuevaPersona(){
        this.personas.push({
            nombre : this.palabraBuscarPersona
        });
        console.log("Nueva persona: " , this.palabraBuscarPersona);
        this.palabraBuscarPersona = "";
    }

    /** proyectos **/
    nuevoProyecto(){
        this.proyectos.push({
            nombre : this.palabraBuscarProyecto
        });
        console.log("Nuevo proyecto: " , this.palabraBuscarProyecto);
        this.palabraBuscarProyecto = "";
    }

    seleccionarProyecto(proyecto : IProyecto = null){
        if (proyecto) {
            this.proyectoSeleccionado = proyecto;
        } else {
            this.proyectoSeleccionado = {
                nombre : ''
            };
        }
    }
}
