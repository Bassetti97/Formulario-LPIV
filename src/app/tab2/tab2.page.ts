import { Component, OnInit } from '@angular/core';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Subscription, distinctUntilChanged, debounceTime } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { IonicModule, ViewDidEnter, ToastController, LoadingController, ModalController } from '@ionic/angular';
import { Pessoa } from '../model/pessoa';
import { PessoaService } from '../pessoaService';
import { Router } from '@angular/router';
import { FormPessoa } from '../form.pessoa';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [ExploreContainerComponent, IonicModule, CommonModule, ReactiveFormsModule]
})


export class Tab2Page implements ViewDidEnter, OnInit {
  pessoas: Pessoa[] = []
  filterForm: FormGroup;
  subscriptions: Subscription[] = [];
  loading: boolean = false;
  


  constructor(
    private pessoaService: PessoaService,
    private router: Router, 
    private modalCtrl: ModalController,
    private toastController: ToastController, 
    private loadingCtrl: LoadingController, 
    private formBuilder: FormBuilder) {
    this.filterForm = this.formBuilder.group({
      nome: ['']
    });
  }

  async criarNovo() {
    const modal = await this.modalCtrl.create({
      component: FormPessoa,
      componentProps: { modal: true }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'close') {
      this.listar()
    }
  }



  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando...',
      duration: 4000

    });
    loading.present();
  }


  ngOnInit(): void {
    const sub = this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => this.filtrar(value.nome!))
    this.subscriptions.push(sub)
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  async filtrar(nome: string) {
    const pessoas = await this.pessoaService.findByNome(nome)
    this.pessoas = pessoas
  }


  ionViewDidEnter(): void {
    this.listar()
  }

  listars() {
    this.pessoaService.listar().then((data) => {
      if (data) {
        this.pessoas = data
      }
    }).catch(error => {
      console.error(error)
    });

  }

  listar() {
    this.loading = true
    this.pessoaService.listar().then((data) => {
      if (data) {
        this.pessoas = data
      }
      this.loading = false
    }).catch(error => {
      console.error(error)
      this.loading = false
    })
  }


  async deletar(pessoa: Pessoa) {
    const deletado = await this.pessoaService.delete(pessoa.email)
    if (deletado) {
      this.listar()
      const toast = await this.toastController.create({
        message: 'Item deletado com sucesso',
        duration: 1500,
        position: 'top'
      });
      await toast.present();
    }
  }

  async editar(pessoa: Pessoa) {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando...',
    });

    await loading.present();

    try {
      this.router.navigate(['tabs/tab1', pessoa.email]);
    } catch (error) {
      console.error('Erro ao navegar para a página de edição', error);
    } finally {
      loading.dismiss();
    }
  }
}
