const botClient = require('bot-client'); 
var request_out = require('request');
var http = require('http');
var fs = require('fs');
const path = require('path');
const PDFDocument = require ('pdfkit');
const fetch = require ('node-fetch')


// только что созданные вами авторизационные данные
const creds = {
  email: '1234@b.com',
  password: '1234qwer',
};

const state = {
  waitingFormat: false
}

const { comment, file } = botClient.connect(creds);

comment.onDirect(async (message) => {
  const { teamId } = message;
  const to = message.data.content.from;
  const { data: { text } } = message.data.content.att[0];
  console.log("text >> ", text);
  if (message.data.content.att[1] == undefined){
    if (text.match(/Hello! You are hired!/)) {
      const att = [{ type: 'text', data: { text: 'Привет, я бот-конвертер. Я помогаю преобразовывать файлы в формат pdf. Чтобы начать работу, отправь мне текстовый файл.' } }];
      await comment.create(teamId, { to, att });
      return;
    }
    const att = [{ type: 'text', data: { text: 'Пожалуйста, отправь мне файл!' } }];
    await comment.create(teamId, { to, att });
    return;
  }
  const fileId = message.data.content.att[1].data.id;
  console.log("Id >> ", fileId);

  const response = await file.getGETUrl(teamId, { id: fileId });

  let URL = response.data.url;
  URL = URL.slice(0, 4).concat(URL.slice(5, URL.length));
  console.log('URL >>', URL);

  const responseFile = await fetch(URL)

  const fileContent = await responseFile.text()

  console.log('------------------------------------')
  console.log('responseFile', fileContent)
  console.log('------------------------------------')

  var file_name = Math.floor(Math.random() * 10000000000);
  var output_file = file_name + '.pdf';

  async function func() {
    await convert();
    await callback();
  }

  async function convert() {
    //Обрабатываем файл
    doc = new PDFDocument;
    doc.text(fileContent)
    // doc.image('unnamed.jpg', 50, 150, {width: 300})
    doc.pipe(fs.createWriteStream(output_file))
    doc.end()
    console.log('Конвертируем', '\n', output_file)
    //Конец обработки файла
  }

  async function callback() {

    //Отправка файла
    const file_path = './' + output_file
    console.log("file >> ", file_path);
    const stats = fs.statSync(file_path);
    console.log(stats);
    const fileSizeInBytes = stats.size;
    console.log(fileSizeInBytes);
  
    const query = {
      filename: output_file,
      authorId: '5a95256220b3170023294729',
      size: fileSizeInBytes
    }
    console.log('отправляем')
    const bucket = await file.getPUTUrl(teamId, query)
    const req = request_out.post(bucket.data.url)
    console.log("URL >>", bucket.data.url);
    req.form().append('file', fs.createReadStream(file_path))
    const att = [{ type: 'file', data: { id: bucket.data.url } }];
    await comment.create(teamId, { to, att });
    console.log("Закончили");
  }

  console.log("Начали");
  func();


  //   // Достаем формат
  //   let index = URL.indexOf('?') - 1;
  //   let format = '';
  //   for (let i = index; URL[i] !== '.'; i--) {
  //     format = URL[i] + format;
  //   }
  //   console.log('Format >>', format);
  
  //   //Скачивание файла
  //   var file_name = Math.floor(Math.random() * 10000000000);
  //   var output_file = file_name + '.pdf';
  //   file_name += '.' + format;
  //   var create_file = fs.createWriteStream(file_name);
  //   var request = http.get(URL, function(data) {
  //     data.pipe(create_file);
  //   });

  //   doc = new PDFDocument;
  // doc.text(fs.readFileSync(file_name));
  // //doc.image('unnamed.jpg', 50, 150, {width: 300})
  // await doc.pipe(fs.createWriteStream(output_file));
  // console.log('ended convert')
  // doc.end(); 

}); 
