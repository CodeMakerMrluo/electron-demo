let myNotification = new Notification('notification title', {
  body: 'hello electron demo.'
});

myNotification.onclick = () => {
  console.log('Notification clicked');
};