import puppeteer from 'puppeteer';
import { MongoClient } from 'mongodb';

async function scrapeInfoBooksToScrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://books.toscrape.com');

  const bookData = await page.evaluate(() => {
    const books = document.querySelectorAll('article.product_pod');
    return Array.from(books).map(book => ({
      title: book.querySelector('h3 a').getAttribute('title'),
      image: book.querySelector('div.image_container a img').getAttribute('src'),
      price: book.querySelector('.price_color').textContent,
      inStock: book.querySelector('.instock.availability').textContent.trim()
    }));
  });

  console.log(bookData);
  await browser.close();
  return JSON.stringify(bookData);
}

scrapeInfoBooksToScrape();

const mydb = "Books";

const url = "mongodb://127.0.0.1:27017/";

async function connectToMongo() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
};

async function crearBaseDeDatos() {
    const client = await connectToMongo();
    const db = client.db(mydb);
    console.log(`Base de datos '${mydb}' creada o conectada.`);
    await client.close();
};

async function crearColeccion(coleccion) {
    const client = await connectToMongo();
    const db = client.db(mydb);
    await db.createCollection(coleccion);
    console.log(`Colección '${coleccion}' creada.`);
    await client.close();
};


async function insertarDocumento(coleccion) {
    const client = await connectToMongo();
    const db = client.db(mydb);
    const collection = db.collection(coleccion);
    const books = await scrapeInfoBooksToScrape();
    const resultado = await collection.insertMany(JSON.parse(books));
    console.log("Documento insertado correctamente");
    await client.close();
};

async function ejecutarOperaciones() {
    await crearBaseDeDatos();
    await crearColeccion('InfoBooks');
    await insertarDocumento('InfoBooks');
  };
  
  ejecutarOperaciones().catch(console.error);