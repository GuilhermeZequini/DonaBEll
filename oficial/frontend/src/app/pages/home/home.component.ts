import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../shared/footer/footer.component";


export interface Task {
  name: string;
  completed: boolean;
  subtasks?: Task[];
}


@Component({
  selector: 'app-home',
  imports: [MatDividerModule, NavbarComponent, RouterOutlet, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly task = signal<Task>({
    name: 'Parent task',
    completed: false,
    subtasks: [
      {name: 'Child task 1', completed: false},
      {name: 'Child task 2', completed: false},
      {name: 'Child task 3', completed: false},
    ],
  });

  readonly partiallyComplete = computed(() => {
    const task = this.task();
    if (!task.subtasks) {
      return false;
    }
    return task.subtasks.some(t => t.completed) && !task.subtasks.every(t => t.completed);
  });

  update(completed: boolean, index?: number) {
    this.task.update(task => {
      if (index === undefined) {
        task.completed = completed;
        task.subtasks?.forEach(t => (t.completed = completed));
      } else {
        task.subtasks![index].completed = completed;
        task.completed = task.subtasks?.every(t => t.completed) ?? true;
      }
      return {...task};
    });
  }
}
