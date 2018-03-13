const botClient = require('bot-client');
const nodePandoc = require('node-pandoc');
var http = require('http');
var fs = require('fs');
// только что созданные вами авторизационные данные
const creds = {
  email: '1234@b.com',
  password: '1234qwer',
};
// sss
const state = {
  waitingFormat: false
}

const { comment, file } = botClient.connect(creds);

comment.onDirect(async (message) => {
  const { teamId } = message;
  const to = message.data.content.from;
  const { data: { text } } = message.data.content.att[0];
  const fileId = message.data.content.att[1].data.id;

  const response = await file.getGETUrl(teamId, { id: fileId });

  let URL = response.data.url;
  URL = URL.slice(0, 4).concat(URL.slice(5, URL.length));
  console.log('URL >>', URL);

  // Достаем формат
  let index = URL.indexOf('?') - 1;
  let format = '';
  for (let i = index; URL[i] !== '.'; i--) {
    format = URL[i] + format;
  }
  console.log('Format >>', format);

  //Скачивание файла
  var file_name = Math.floor(Math.random() * 10000000000);
  var output_file = file_name + '.pdf';
  file_name += '.' + format;
  var create_file = fs.createWriteStream(file_name);
  var request = http.get(URL, function(data) {
    data.pipe(create_file);
  });

  // Обработка файла 

  let src = './' + file_name;
  console.log(src);
  // Arguments can be either a single String or in an Array 
  let args = ['-t','latex','-o', output_file];
  
  // // Set your callback function 
  const callback = (err, result) => {
    if (err) console.error('Oh Nos: ',err)
    console.log('in cb');
    fs.unlink(src, (err) => {
      if (err) throw err;
      console.log(src, ' was deleted');
    });
    return console.log(result), result
  }
  // Call pandoc 
  nodePandoc(src, args, callback);   
  //Конец обработки файла
  // Assuming that 'path/file.txt' is a regular file.
  // Удаляем файлы с компьютера
});
