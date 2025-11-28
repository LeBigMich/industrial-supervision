from pyModbusTCP.client import ModbusClient
import time

# Configuration de la connexion
IP_AUTOMATE = "172.16.1.24"
PORT = 502 # Port standard Modbus TCP

# Création du client
client = ModbusClient(host=IP_AUTOMATE, port=PORT, auto_open=True)

print(f"Connexion à {IP_AUTOMATE}...")

if client.open():
    print("Connecté ✅")
   
    # Lecture de l'adresse %M505
    # En Modbus, %M = Coils.
    # read_coils(adresse, nombre_de_bits)
    liste_bits = client.read_coils(505, 1)
   
    if liste_bits:
        etat_bouton = liste_bits[0] # On récupère le premier (et seul) résultat
        print(f"État du bouton %M505 : {etat_bouton}")
       
        # Exemple : Si le bouton est True, on affiche un message
        if etat_bouton:
            print("Le bouton est ACTIF !")
        else:
            print("Le bouton est inactif.")
    else:
        print("Erreur de lecture (adresse incorrecte ou automate occupé)")
       
    client.close()
else:
    print("Impossible de se connecter ❌. Vérifiez l'adresse IP et le câble.")