import {Component, Pipe, Injectable, PipeTransform} from '@angular/core';
import {AngularFire, FirebaseListObservable, AuthProviders, AuthMethods} from 'angularfire2'
import {estatusTarea,IParametrosFiltrar} from "./app.interface";
import {debug} from "util";
// import { HotkeysService, Hotkey } from 'angular2-hotkeys';

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

export interface IParametrosOrdenacion {
    estatus : estatusTarea,
    persona : string
}
@Pipe({
    name: 'filtroListado',
    pure: false
})
@Injectable()
export class FiltroListadoPipe implements PipeTransform {
    transform(items: any[], parametrosFiltar: IParametrosFiltrar): any {

        if(items==null){
            return null;
        }

        return items.filter(item => {
            if (parametrosFiltar.estatus) {
                if(item.estatus!=parametrosFiltar.estatus)
                    return false;
            }

            if (parametrosFiltar.proyecto) {
                if(item.proyecto!=parametrosFiltar.proyecto)
                    return false;
            }

            if (parametrosFiltar.persona) {
                if(item.persona!=parametrosFiltar.persona)
                    return false;
            }

            if (parametrosFiltar.palabra) {
                if(item.contenido.toLowerCase().indexOf(parametrosFiltar.palabra) === -1)
                    return false;
            }

            //no se aplico ningun filtro
            return true;
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
    user = null;

    // tareaSeleccionada: ITarea;
    opcionSeleccionada : string;
    proyectoSeleccionado : IProyecto = {
        nombre : ''
    };

    verMenu : boolean = true;

    /*parametrosOrdenacion : IParametrosOrdenacion = {
        estatus : null,
        persona : ""
    };*/

    parametrosFiltrar : IParametrosFiltrar = {
        estatus : null,
        palabra : null,
        proyecto : null,
        persona : null
    };

    //,private hotkeysService: HotkeysService

    toggleSidebar(){
        this.verMenu = !this.verMenu;
    }

    constructor(private af: AngularFire) {
        this.af.auth.subscribe(user => {
            if (user) {
                // user logged in
                let emailPermitidos = ['popoca.ortiz@gmail.com','fernando.p@gme.mx','erick@gme.mx'];
                // no esta en los correos permitidos
                if (user.google.email) {
                    if (emailPermitidos.indexOf(user.google.email)==-1) {
                        alert("No permitido");
                        return;
                    }
                }


                this.user = user.google;

                this.tareas = this.af.database.list("/tareas", {
                    query: {
                        orderByChild: 'carpeta',
                        equalTo: 'inbox'
                    }
                });
                this.personas = this.af.database.list("/personas");
                this.proyectos = this.af.database.list("/proyectos");
            }
            else {
                // user not logged in
                this.user = null;
            }
        });

        this.opcionSeleccionada = "inbox";

        /*this.hotkeysService.add(new Hotkey('meta', (event: KeyboardEvent): boolean => {
            console.log('Typed hotkey',event);
            return false; // Prevent bubbling
        }));*/
    }

    teclaControlActivada = false;

    //ordenacion
    actualizarParametroFiltrar(actualizar : string, valor : string){
        if(actualizar=='palabra')
            this.parametrosFiltrar.palabra = this.palabraBuscar;
        else if (actualizar=='estatus') {
            //si ya lo tiene le quitamos el filtro
            if(this.parametrosFiltrar.estatus == valor)
                this.parametrosFiltrar.estatus = null;
            else
                this.parametrosFiltrar.estatus = valor;
        } else if (actualizar == 'persona') {
            this.parametrosFiltrar.persona = valor;
        }
    }

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
            method: AuthMethods.Popup,
            scope : ['email']
        });
    }

    checkLogin(){
        return this.user;
    }

    logout() {
        this.af.auth.logout();
        this.tareas = null;
        this.proyectos = null;
        this.personas = null;
        this.user = null;
    }

    getFecha() : string {
        let f = new Date();
        let fecha = "";
        fecha += f.getFullYear() + "-";

        if (f.getMonth().toString().length==1) {
            fecha += "0"+f.getMonth() + "-";
        } else {
            fecha += f.getMonth() + "-";
        }

        if (f.getDay().toString().length==1) {
            fecha += "0"+f.getDay();
        } else {
            fecha += f.getDay();
        }

        return fecha;
    }
    nuevaTarea() {

        if(!this.proyectoSeleccionado.nombre.length){
            alert("Selecciona un proyecto");
            return;
        }

        this.tareas.push({
            fecha: 'hoy',
            titulo: this.palabraBuscar,
            fechaCreada : this.getFecha(),
            contenido: "Contenido de la tarea",
            estatus: "pendiente",
            carpeta : "inbox",
            proyecto : this.proyectoSeleccionado.nombre,
            tags: []
        });
        this.palabraBuscar = "";
    }

    cambiarEstatus(estatus: estatusTarea, tarea : ITarea) {

        let nuevaInfo : any = {
            estatus : estatus
        };

        if (estatus == 'completada') {
            nuevaInfo.fechaCompletada = this.getFecha();
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
                if (this.checkLogin()) {
                    this.tareas = this.af.database.list("/tareas",{
                        query: {
                            orderByChild: 'carpeta',
                            equalTo: 'inbox'
                        }
                    });
                }
                break;
            case 'todas':
                if (this.checkLogin()) {
                    this.tareas = this.af.database.list("/tareas");
                }
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
            this.parametrosFiltrar.proyecto = proyecto.nombre;
        } else {
            this.parametrosFiltrar.proyecto = null;
            this.proyectoSeleccionado = {
                nombre : ''
            };
        }
    }

    /**
     * ordenacion
     */

    /*setParametroOrdenacion(campo : 'estatus'|'persona', valor : string){

        //si el campo actual ya tiene activa la ordenacion
        if(this.parametrosOrdenacion[campo]==valor){
            //se la quitamos
            this.parametrosOrdenacion[campo] = null;
        } else {
            //si no se la ponemos
            this.parametrosOrdenacion[campo] = "";
        }
    }*/
}
