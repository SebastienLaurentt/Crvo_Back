const statusCategories = {
  "Transport à vide": "Transport aller",
  "Déstockage last check demandé": "Livraison",
  "Last check en attente d'orientation": "Livraison",
  "En attente de retouche & plaques": "Production",
  "Retouche & plaques en cours": "Production",
  "En attente d'arrivée usine": "Transport aller",
  "Non destiné à l'usine": "Transport aller",
  "En attente de transport aller": "Transport aller",
  "Transport aller en cours": "Transport aller",
  "Réceptionné en usine": "Expertise",
  "En attente d'expertise dynamique": "Expertise",
  "Prêt pour expertise dynamique": "Expertise",
  "Expertise dynamique en cours": "Expertise",
  "Demande de convoyage vers Lavage": "Expertise",
  "En attente de lavage rapide": "Expertise",
  "Lavage rapide en cours": "Expertise",
  "Demande de convoyage vers parc anomalie": "Production",
  "En attente parc anomalie": "Production",
  "Stocké sur parc anomalie": "Production",
  "Demande de convoyage vers expertise": "Expertise",
  "En attente d'expertise statique": "Expertise",
  "Expertise statique en cours": "Expertise",
  "Devis de remise en état effectué": "Expertise",
  "Demande de convoyage vers parc d'attente chiffrage": "Expertise",
  "Stocké au parc d'attente chiffrage": "Expertise",
  "Dmd convoi vers dossier à finaliser": "Expertise",
  "Dossier à finaliser": "Expertise",
  "Dmd convoi vers parc attente chiffrage identifié": "Expertise",
  "Stocké sur parc d'attente chiffrage identifié": "Expertise",
  "Dmd convoi vers parc attente chiffrage devis à faire": "Expertise",
  "Dmd convoi vers parc attente chiffrage PB à communiquer": "Expertise",
  "Stocké sur parc d'attente chiffrage PB à communiquer": "Expertise",
  "Stocké sur parc d'attente (Devis à ajuster)": "Magasin",
  "Stocké sur parc d'attente (Devis validé)": "Magasin",
  "Demande de convoyage vers parc d'attente travaux": "Production",
  "Stocké sur parc d'attente (Réparation jante)": "Production",
  "Stocké sur parc d'attente (Rép jante en cours)": "Production",
  "Stocké sur parc d'attente (Mécanique)": "Production",
  "Stocké sur parc d'attente (Carrosserie)": "Production",
  "Stocké sur parc d'attente (DSP)": "Production",
  "Stocké sur parc d'attente (Lavage)": "Production",
  "Stocké sur parc d'attente (Préparation)": "Production",
  "Stocké sur parc d'attente (Docs CT manquant)": "Production",
  "Stocké au contrôle technique (Docs CT manquant)": "Production",
  "Stocké au contrôle technique (Docs CT reçus)": "Production",
  "Stocké sur parc d'attente (Départ CT)": "Production",
  "Stocké sur parc d'attente (Retour CT)": "Production",
  "En attente d'ordonnancement": "Production",
  "Demande de convoyage vers parc (rep jante à faire)": "Production",
  "Demande de convoyage vers atelier (rep jante à faire)": "Production",
  "En attente de jantes": "Production",
  "Jantes en cours": "Production",
  "En attente de validation travaux jantes": "Production",
  "Travaux jantes validés": "Production",
  "Demande de convoyage vers diagnostic": "Production",
  "En attente de diagnostic": "Production",
  "Diagnostic en cours": "Production",
  "Demande de convoyage vers mécanique": "Production",
  "En attente de mécanique": "Production",
  "Mécanique en cours": "Production",
  "En attente de validation travaux mécanique": "Production",
  "Travaux mécanique validés": "Production",
  "Demande de convoyage vers Restor-FX": "Production",
  "En attente de Restor-FX": "Production",
  "Restor-FX en cours": "Production",
  "En attente de validation travaux Restor-FX": "Production",
  "Travaux Restor-FX validés": "Production",
  "Demande de convoyage vers Fixline 1": "Production",
  "En attente de Fixline 1": "Production",
  "Fixline 1 en cours": "Production",
  "En attente de validation travaux Fixline 1": "Production",
  "Travaux Fixline 1 validés": "Production",
  "Demande de convoyage vers Fixline 2": "Production",
  "En attente de Fixline 2": "Production",
  "Fixline 2 en cours": "Production",
  "En attente de validation travaux Fixline 2": "Production",
  "Travaux Fixline 2 validés": "Production",
  "Demande de convoyage vers tôlerie": "Production",
  "En attente de tôlerie": "Production",
  "Tôlerie en cours": "Production",
  "Demande de convoyage vers carrosserie": "Production",
  "En attente de carrosserie": "Production",
  "Carrosserie en cours": "Production",
  "En attente de peinture": "Production",
  "Peinture en cours": "Production",
  "Demande de convoyage vers finition": "Production",
  "En attente de finition": "Production",
  "Finition en cours": "Production",
  "En attente de validation travaux carrosserie": "Production",
  "Travaux carrosserie validés": "Production",
  "Demande de convoyage vers DSP": "Production",
  "En attente de DSP": "Production",
  "DSP en cours": "Production",
  "En attente de validation travaux DSP": "Production",
  "Travaux DSP validés": "Production",
  "En attente de lavage": "Production",
  "Lavage en cours": "Production",
  "En attente de validation lavage": "Production",
  "Demande de convoyage vers préparation": "Production",
  "En attente de préparation": "Production",
  "Préparation en cours": "Production",
  "En attente de validation travaux préparation": "Production",
  "Travaux préparation validés": "Production",
  "Demande de convoyage vers contrôle qualité": "Production",
  "En attente de contrôle qualité": "Production",
  "En attente de travaux suite Contrôle Qualité": "Production",
  "En attente de photo": "Production",
  "Photo en cours": "Production",
  "Demande de convoyage vers Sortie Usine": "Production",
  "Sortie Usine": "Stockage",
  "Demande de convoyage vers parc d'attente (CT)": "Production",
  "Demande de convoyage vers CT en cours": "Production",
  "Convoyage vers CT en cours": "Production",
  "Contrôle technique en cours": "Production",
  "Contrôle technique accepté (Attente convoyage)": "Production",
  "Retour du CT en cours": "Production",
  "Contrôle technique refusé (Attente convoyage)": "Production",
  "Contrôle technique accepté avec réserve (stocké sur parc)": "Production",
  "Contrôle technique refusé (Stocké sur parc)": "Production",
  "En attente de stockage expédition": "Stockage",
  "En attente de transport retour": "Transport retour",
  "Transport retour prévu": "Transport retour",
  "Reprise Qualité en attente d'orientation": "Production",
  "Transport retour effectué": "Transport retour",
  "Stocké sur parc d'attente chiffrage attente retour devis": "Client",
  "Stocké sur parc d'attente chiffrage PR à commander": "Magasin",
  "Sous-traitance carrosserie en cours": "Production",
  "Stocké sur parc d'attente chiffrage" : "Expertise",
};

module.exports = { statusCategories };

