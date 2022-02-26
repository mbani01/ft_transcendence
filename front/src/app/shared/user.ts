export class User {

  constructor(public uid: number, public name: string) {

  }

  get img() {
    // console.log('hello ?');
    return `/assets/avatars/${this.uid}`;
  }

}
