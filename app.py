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

    # Temporary folder (Repo ke bahar, taake space full na ho)
    work_dir = os.path.join(tempfile.gettempdir(), 'lyra_ship', safe_name)
    os.makedirs(work_dir, exist_ok=True)

    try:
        if file and file.filename:
            filepath = os.path.join(work_dir, file.filename)
            file.save(filepath)
            
            if file.filename.lower().endswith('.zip'):
                with zipfile.ZipFile(filepath, 'r') as zip_ref:
                    zip_ref.extractall(work_dir)
                os.remove(filepath)
                
                # Agar zip ke andar ek hi folder hai to uske andar ki files bahar layen
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

        # ShipStatic Deploy (No Token Required)
        result = subprocess.run(['npx', '@shipstatic/ship', work_dir], capture_output=True, text=True, shell=True)
        output = result.stdout + result.stderr
        print("ShipStatic Output:", output)

        # Live URL Extract karein
        link_match = re.search(r'https://[a-zA-Z0-9-]+\.shipstatic\.com', output)
        
        if link_match:
            link = link_match.group(0)
            # Claim URL extract karein (permanent karne ke liye)
            claim_match = re.search(r'https://[^\s]+claim[^\s]*', output)
            claim_url = claim_match.group(0) if claim_match else None
            
            return jsonify({
                "success": True, 
                "link": link,
                "claim_url": claim_url
            })
        else:
            return jsonify({
                "error": "ShipStatic link generate nahi hua.",
                "details": output[-300:]
            }), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Kaam hone ke baad temporary folder delete karein (Repo space bachega)
        if os.path.exists(work_dir):
            shutil.rmtree(work_dir)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
