from flask import Flask, request, jsonify, render_template
import os, subprocess, zipfile, shutil, tempfile, re

app = Flask(__name__, template_folder='.')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/publish', methods=['POST'])
def publish():
    project_name = request.form.get('projectName', '').strip()
    html_code = request.form.get('htmlCode', '')
    file = request.files.get('file')

    if not project_name:
        return jsonify({"error": "Project name zaroori hai!"}), 400

    safe_name = re.sub(r'[^a-zA-Z0-9_-]', '', project_name)
    if not safe_name:
        return jsonify({"error": "Galat project name. Sirf letters, numbers, - aur _ use karein."}), 400

    work_dir = os.path.join(tempfile.gettempdir(), 'lyra_pinme', safe_name)
    os.makedirs(work_dir, exist_ok=True)

    try:
        if file and file.filename:
            filepath = os.path.join(work_dir, file.filename)
            file.save(filepath)
            
            if file.filename.lower().endswith('.zip'):
                with zipfile.ZipFile(filepath, 'r') as zip_ref:
                    zip_ref.extractall(work_dir)
                os.remove(filepath)
                
                items = os.listdir(work_dir)
                if len(items) == 1 and os.path.isdir(os.path.join(work_dir, items[0])):
                    subfolder = os.path.join(work_dir, items[0])
                    for sub_item in os.listdir(subfolder):
                        shutil.move(os.path.join(subfolder, sub_item), work_dir)
                    os.rmdir(subfolder)
        elif html_code.strip():
            with open(os.path.join(work_dir, 'index.html'), 'w', encoding='utf-8') as f:
                f.write(html_code)
        else:
            return jsonify({"error": "Na code mila, na file!"}), 400

        # PinMe Upload Command
        result = subprocess.run(['pinme', 'upload', work_dir], capture_output=True, text=True, shell=True)
        output = result.stdout + result.stderr
        print("PinMe Output:", output) # Debugging ke liye log

        # 1. Pehle preview URL format dhoondein (https://pinme.eth.limo/#/preview/...)
        link_match = re.search(r'https://[^\s]+eth\.limo[^\s]*', output)
        
        if link_match:
            link = link_match.group(0)
        else:
            # 2. Agar preview URL na mile, toh CID (bafy...) dhoondein aur dweb.link ka link banayein
            cid_match = re.search(r'\b(bafy[a-zA-Z0-9]+)\b', output)
            if cid_match:
                link = f"https://{cid_match.group(1)}.ipfs.dweb.link"
            else:
                # Agar dono na mile toh error ke sath PinMe ka poora output bhejein
                return jsonify({
                    "error": "PinMe link generate nahi hua.",
                    "details": output # Asal error dekhne ke liye
                }), 500

        return jsonify({"success": True, "link": link})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(work_dir):
            shutil.rmtree(work_dir)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
