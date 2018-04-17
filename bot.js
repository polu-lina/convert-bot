const botClient = require('bot-client');
//const nodePandoc = require('node-pandoc');
const pandoc = require('simple-pandoc'); 
var request_out = require('request');
var http = require('http');
var fs = require('fs');
const path = require('path');

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

  const htmlToMarkdown = pandoc(format, 'pdf');
  const inputStream = fs.createReadStream(file_name);
  const outputStream = fs.createWriteStream(output_file);
  htmlToMarkdown.stream(inputStream).pipe(outputStream);

  const file_puth = './' + file_name;
  console.log("file >> ", file_puth);
  const stats = fs.statSync(file_puth);
  const fileSizeInBytes = stats.size;

  const query = {
    filename: file_name,
    authorId: '5a95256220b3170023294729',
    size: fileSizeInBytes
  }
  const bucket = await file.getPUTUrl(teamId, query)
  const req = request_out.post(bucket.data.url)
  req.form().append('file', fs.createReadStream(file_puth))
  const att = [{ type: 'file', data: { id: bucket.data.url } }];
  await comment.create(teamId, { to, att });
  // const result = await readFileAsArrayBuffer(file_puth)
  // console.log("result >>", result);
  // const request_out = new XMLHttpRequest()
  // const formData = new FormData()
  // formData.append('Content-Type', "application/pdf")
  // formData.append('file', file_puth)
  // request_out.open('POST', bucket.data.url, true)
  // request_out.send(formData)
  // await http.request({
  //     method: 'POST',
  //     url: bucket.data.url,
  //     headers: {
  //       'Cache-Control': 'public,max-age=3600',
  //       // 'Content-Length': file.size,
  //       'Content-Type': "application/pdf"

  //     },
  //     body: file_puth
  //   });

//   // Обработка файла 

//   let src = './' + file_name;
//   console.log(src);
//   // Arguments can be either a single String or in an Array 
//   let args = ['-t','latex','-o', output_file];
  
//   // // Set your callback function 
//   const callback = async (err, result) => {
//     if (err) console.error('Oh Nos: ',err)
//     console.log('in cb');
//     // Удаляем исходный файл с компьютера
//     // if (result) {
//     //   fs.unlink(src, (err) => {
//     //     if (err) throw err;
//     //     console.log(src, ' was deleted');
//     //   });
//     //   return console.log(result), result
//     // }
//   }
//   // Call pandoc 
//   try {
//     console.log('aaaaaa')
//     await nodePandoc(src, args, callback);   
//     console.log('bbbbbbb')
//   } catch(e) {
//     console.log('e: ', e);
//   }
//   //Конец обработки файла
//   file_name = output_file;
//   output_file = './' + output_file;
//   // fs.readFile(output_file, (err, data) => {
//   //   if (err) throw err;
//   //   console.log(data);
//   // });
//   // // Assuming that 'path/file.txt' is a regular file.
//   // Удаляем файлы с компьютера

  
  

//   const fileOut = output_file;

//     // fs.readFile(file, (err, data) => {
//     //   if (err) throw err;
//     //   console.log(JSON.stringify(data));
//     // });
//     try {
//       console.log('output ', fileOut)
//       const result = fs.readFileSync(fileOut);
//     } catch (error) {
//       console.log('error 1 ', error)      
//     }
//     console.log('result > ', JSON.stringify(result));
//     try {
//       const stats = await fs.statSync(fileOut);
//     } catch (error) {
//       console.log('error 2 ', error)      
//     }


//     const fileSizeInBytes = stats.size;
//     const nameFile = path.basename(fileOut);
//     console.log('nameFile > ', nameFile);
//     console.log('fileSizeInBytes ', fileSizeInBytes);


//   const query = {
//     filename: file_name,
//     authorId: '5a95256220b3170023294729',
//     size: fileSizeInBytes
//   }
//   const bucket = await File.getPUTUrl(teamId, query)
//   const result1 = await readFileAsArrayBuffer(file)
//   const response1 = await request({
//     method: 'PUT',
//     url: bucket.data.url,
//     headers: {
//       'Cache-Control': 'public,max-age=3600',
//       // 'Content-Length': file.size,
//       'Content-Type': 'pdf'
//     },
//     body: result1
//   });
//   consoe.log('response ', response1)
});
