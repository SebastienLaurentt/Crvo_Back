const TestModel = require("../models/test.model");
const { connectToFTP } = require("../services/ftpServices");
const xlsx = require('xlsx');
const { Writable } = require('stream');

module.exports.initializeTestData = async () => {
	let client;

	try {
		client = await connectToFTP();

		console.log("Tentative de téléchargement et traitement du fichier:");
		
		// Créer un stream en mémoire
		const chunks = [];
		const memoryStream = new Writable({
			write(chunk, encoding, callback) {
				chunks.push(chunk);
				callback();
			}
		});

		// Utiliser la méthode downloadTo pour télécharger le fichier
		await client.downloadTo(memoryStream, "test.xlsx");

		const buffer = Buffer.concat(chunks);

		console.log("Fichier téléchargé. Traitement des données...");

		const workbook = xlsx.read(buffer, { type: 'buffer' });
		const sheetName = workbook.SheetNames[0];
		const sheet = workbook.Sheets[sheetName];
		
		// Extraire les données sans en-têtes
		const data = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0];

		console.log("Données extraites du fichier Excel:", data);

		// Supprime toutes les données existantes
		await TestModel.deleteMany({});

		// Insère les nouvelles données
		if (data && data.length === 3) {
			const newTest = new TestModel({
				prenom: data[0],
				nom: data[1],
				categorie: data[2],
			});

			await newTest.save();
			console.log("Nouvel enregistrement inséré:", newTest);
		} else {
			console.log("Le format des données n'est pas correct. Attendu: 3 colonnes.");
		}

		console.log(`Données de test initialisées avec succès. 1 enregistrement importé.`);
	} catch (err) {
		console.error("Erreur lors de l'initialisation des données de test:", err);
	} finally {
		if (client) {
			client.close();
		}
	}
};