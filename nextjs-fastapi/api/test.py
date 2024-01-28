import face_recognition

known_image1 = face_recognition.load_image_file("test1.png")
unknown_image1 = face_recognition.load_image_file("test2.png")
known_image2 = face_recognition.load_image_file("test3.png")
known_image3 = face_recognition.load_image_file("test4.png")

known_encoding1 = face_recognition.face_encodings(known_image1)[0]
known_encoding2 = face_recognition.face_encodings(known_image2)[0]
known_encoding3 = face_recognition.face_encodings(known_image3)[0]
unknown_encoding = face_recognition.face_encodings(unknown_image1)[0]

results = face_recognition.compare_faces([known_encoding1, known_encoding2, known_encoding3], unknown_encoding)

print(results)
