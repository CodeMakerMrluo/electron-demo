let myNotification = new Notification('notification title', {
  body: 'hello electron demo.',
  icon: './imgs/ico.png'
});

myNotification.onclick = () => {
  console.log('Notification clicked');
};