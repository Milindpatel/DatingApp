import { Routes } from '@angular/router';
import { authGuard } from './_guards/auth.guard';
import { preventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { memberDetailResolver, memberEditResolver, memberListResolver } from './_resolvers/user.resolvers';
import { HomeComponent } from './home/home.component';
import { ListsComponent } from './lists/lists.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MessagesComponent } from './messages/messages.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Dating App' },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'members', component: MemberListComponent, resolve: { users: memberListResolver }, title: 'Matches' },
      { path: 'members/:id', component: MemberDetailComponent, resolve: { user: memberDetailResolver } },
      {
        path: 'member/edit',
        component: MemberEditComponent,
        resolve: { user: memberEditResolver },
        canDeactivate: [preventUnsavedChanges],
        title: 'Edit profile',
      },
      { path: 'messages', component: MessagesComponent, title: 'Messages' },
      { path: 'lists', component: ListsComponent, title: 'Lists' },
    ],
  },
  { path: '**', redirectTo: '' },
];
