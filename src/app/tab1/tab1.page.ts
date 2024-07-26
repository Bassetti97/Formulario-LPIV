import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseService } from '../databaseService';
import { PessoaService } from '../pessoaService';
import { Pessoa } from '../model/pessoa';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


//activedRouter


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, ReactiveFormsModule],
})


export class Tab1Page implements OnInit {
  formGroup: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    telefone: [''],
    email: ['', Validators.email],
    hobie: ['']
  })
  emailToEdit: string | null = null;

  constructor(private fb: FormBuilder, private databaseService: DatabaseService,
    private pessoaService: PessoaService, private alertController: AlertController,
    private router: Router, private activatedRoute: ActivatedRoute) { }

ngOnInit(): void {
    
}
  ionViewDidEnter(): void {
    this.emailToEdit = null
    const email = this.activatedRoute.snapshot.paramMap.get("email");
    if (email) {
      console.log(email)
      this.pessoaService.get(email).then(pessoa => {
        if (pessoa) {
          this.formGroup.patchValue(pessoa)
          this.emailToEdit = email
        }
      })
    }
  }

  editar(pessoa: Pessoa) {
    this.router.navigate(['tabs/tab1', pessoa.email])
  }

  async salvar() {
    if (this.formGroup.valid) {
      if (this.emailToEdit) {
        this.pessoaService.editar(this.formGroup.value, this.emailToEdit);
      } else {
        this.pessoaService.criar(this.formGroup.value);
      }
      this.pessoaService.criar(this.formGroup.value)
      const alert = await this.alertController.create({
        header: 'Item salvo',
        message: 'Item salvo com sucesso',
        buttons: ['OK'],
      })
      await alert.present()
    } else {
      const alert = await this.alertController.create({
        header: 'Formulário inválido',
        message: 'Formulário inválido',
        buttons: ['OK'],
      })
      await alert.present()
    }
  }

}
