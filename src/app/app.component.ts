import { Component , Pipe , Injectable , PipeTransform } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2'
type estatusTarea = 'pendiente' | 'completa' | 'cancelada' | 'espera';

export interface ITarea{
  fecha : string
  titulo : string
  contenido : string
  estatus : estatusTarea
  tags : string[]
  fechaCompletada ?:string
}

@Pipe({
  name: 'filtroListado',
  pure: false
})
@Injectable()
export class FiltroListadoPipe implements PipeTransform {
  transform(items: any[], palabra : string): any {
    return items.filter(item =>{
      if(!palabra)
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

  tareas : FirebaseListObservable<ITarea[]>;

  tareaSeleccionada : ITarea;

  constructor(af : AngularFire){
      this.tareas = af.database.list("/tareas");
  }
  nuevaTarea(){
    let titulo = "";
    if(titulo = prompt("Nombre")){
      this.tareas.push({
        fecha : 'hoy',
        titulo : titulo,
        contenido : "",
        estatus : "pendiente",
        tags : []
      });
    }
  }

  seleccionarTarea(tarea : ITarea){
    this.tareaSeleccionada = tarea;
  }
  cambiarEstatus(estatus : estatusTarea){
    this.tareaSeleccionada.estatus = estatus;
    if(estatus == 'completa'){
      this.tareaSeleccionada.fechaCompletada = "Hoy";
    }
  }
}
