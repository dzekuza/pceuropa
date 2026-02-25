import re

html_input = """
<tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/355'" >
			<td>Downtown Piano Lab</td>
			<td>36rhzsmx</td>
			<td>Downtown Piano Lab</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/355"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/354'" >
			<td>Lindex</td>
			<td>dt2b06i2</td>
			<td>Lindex</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/354"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/353'" >
			<td>HOLIGANS INDIA</td>
			<td>zdm273u8</td>
			<td>Dialogai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/353"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/352'" >
			<td>Dangerpark</td>
			<td>6wog04cv</td>
			<td>Danger Park</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/352"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/351'" >
			<td>FIGHTERSHOP</td>
			<td>aps3mhod</td>
			<td>FIGHTERSHOP</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/351"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/350'" >
			<td>KGYM</td>
			<td>vwvom5ya</td>
			<td>K GYM</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/350"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/349'" >
			<td>Indigogeles</td>
			<td>ve5ncwdy</td>
			<td>Indigo gėlės</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/349"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/347'" >
			<td>SushiExpress</td>
			<td>7ebv7zxk</td>
			<td>Dialogai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/347"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/346'" >
			<td>PizzaDelGatto</td>
			<td>tq202r0m</td>
			<td>Dialogai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/346"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/345'" >
			<td>ArchiesBurger</td>
			<td>h6hbhvvo</td>
			<td>Dialogai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/345"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/344'" >
			<td>AsiaViet</td>
			<td>ekttjmb0</td>
			<td>Dialogai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/344"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/343'" >
			<td>BaoBun</td>
			<td>6x3w84f8</td>
			<td>Dialogai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/343"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/342'" >
			<td>Chačapuri</td>
			<td>4mjwjsxp</td>
			<td>Dialogai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/342"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/341'" >
			<td>Kiras</td>
			<td>5jqhrnib</td>
			<td>Dialogai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/341"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/340'" >
			<td>VilmaBH</td>
			<td>VilmaBH</td>
			<td>Dreams come true</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/340"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/339'" >
			<td>CAFFEINE</td>
			<td>xqjnspc7</td>
			<td>CAFFEINE</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/339"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/338'" >
			<td>Perfectus Clinica</td>
			<td>yjo2j0h6</td>
			<td>Perfectus clinica</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/338"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/337'" >
			<td>RIEKER</td>
			<td>7un7aqf3</td>
			<td>RIEKER</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/337"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/336'" >
			<td>Eurokos</td>
			<td>d38qwate</td>
			<td>Eurokos</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/336"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/335'" >
			<td>MV GROUP Distribution LT</td>
			<td>8vijbkfd</td>
			<td>bottlery</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/335"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/334'" >
			<td>Tops</td>
			<td>gb0qpmpk</td>
			<td>Tops</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/334"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/333'" >
			<td>Seva The Gentleman</td>
			<td>mofvbcoz</td>
			<td>Seva The Gentleman</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/333"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/330'" >
			<td>IKI</td>
			<td>pwajhx27</td>
			<td>IKI</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/330"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/329'" >
			<td>Barzdaskuciai</td>
			<td>vqjphqjy</td>
			<td>Barzdaskučiai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/329"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/328'" >
			<td>SIMITRI</td>
			<td>f2v5mpbf</td>
			<td>SIMITRI</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/328"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/327'" >
			<td>ETE STUDIO</td>
			<td>87ypma6w</td>
			<td>ETE STUDIO</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/327"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/326'" >
			<td>OPTOMETRIJOS CENTRAS</td>
			<td>h3o6zi2q</td>
			<td>OPTOMETRIJOS CENTRAS</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/326"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/325'" >
			<td>PI-PILATES</td>
			<td>xfgcsqba</td>
			<td>PI-PILATES</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/325"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/324'" >
			<td>CODEKUS</td>
			<td>edmmo60k</td>
			<td>CODEKUS</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/324"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/323'" >
			<td>DORO boutique</td>
			<td>7jsiechu</td>
			<td>DORO boutique</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/323"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/322'" >
			<td>TEXTALE</td>
			<td>6rj88c4e</td>
			<td>TEXTALE</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/322"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/321'" >
			<td>E-SHAPED</td>
			<td>z7hf3k7o</td>
			<td>E-SHAPED</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/321"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/320'" >
			<td>ROYAL SMOKE</td>
			<td>dnmsm6oj</td>
			<td>ROYAL SMOKE</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/320"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/319'" >
			<td>ODORE DA MORE</td>
			<td>argsdg7r</td>
			<td>ODORE DA MORE</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/319"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/318'" >
			<td>KULIKSYSTEM</td>
			<td>04q6ybo8</td>
			<td>KULIKSYSTEM</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/318"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/317'" >
			<td>Baldu menas</td>
			<td>24jqa0cd</td>
			<td>Baldu menas</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/317"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/315'" >
			<td>GERA DOVANA</td>
			<td>istv07oq</td>
			<td>GERA DOVANA</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/315"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/314'" >
			<td>Raktai ir batai</td>
			<td>qtzuwdvg</td>
			<td>Raktai ir batai</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/314"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/313'" >
			<td>BLISS BY VIOLETA</td>
			<td>6nixb0wj</td>
			<td>BLISS BY VIOLETA</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/313"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/312'" >
			<td>Avitela</td>
			<td>qynezpt3</td>
			<td>Avitela</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/312"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/311'" >
			<td>Moustache Boutique</td>
			<td>defyh7p7</td>
			<td>Moustache Boutique</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/311"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/309'" >
			<td>BELONTA</td>
			<td>nsercur6</td>
			<td>BELONTA</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/309"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/308'" >
			<td>ALI ŠOKOLADINĖ</td>
			<td>xxvid6q4</td>
			<td>ALI ŠOKOLADINĖ</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/308"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/307'" >
			<td>RENT BOUTIQUE</td>
			<td>rk6d83od</td>
			<td>RENT BOUTIQUE</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/307"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/306'" >
			<td>RUDNĖ</td>
			<td>rmrhaqb5</td>
			<td>RUDNĖ</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/306"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/305'" >
			<td>DUST</td>
			<td>ccpmj6a4</td>
			<td>DUST</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/305"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/304'" >
			<td>HURACAN</td>
			<td>wzwz2mzk</td>
			<td>HURACAN</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/304"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/303'" >
			<td>COCCINELLE</td>
			<td>n007na0b</td>
			<td>COCCINELLE</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/303"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/302'" >
			<td>WEEKEND MAXMARA</td>
			<td>j54xewqw</td>
			<td>WEEKEND MAXMARA</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/302"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/301'" >
			<td>MARELLA</td>
			<td>yokux63w</td>
			<td>MARELLA</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/301"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/300'" >
			<td>APRANGA</td>
			<td>iq67ftt4</td>
			<td>APRANGA</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/300"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/299'" >
			<td>IDEA&DESIGN</td>
			<td>p3xnm3yn</td>
			<td>IDEA&DESIGN</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/299"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/298'" >
			<td>GIVEN</td>
			<td>umkzry80</td>
			<td>GIVEN</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/298"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/297'" >
			<td>EAT SUSHI</td>
			<td>qcwwzh2w</td>
			<td>EAT SUSHI</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/297"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/296'" >
			<td>THEDUST</td>
			<td>z0gkbdm0</td>
			<td>THEDUST</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/296"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/295'" >
			<td>HAPPYFLOWERS</td>
			<td>4hvpspnk</td>
			<td>HAPPYFLOWERS</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/295"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/294'" >
			<td>TOMASGOLD</td>
			<td>rqx4wxd5</td>
			<td>TOMASGOLD</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/294"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/293'" >
			<td>HOBBYSHOP</td>
			<td>emdd336f</td>
			<td>HOBBY SHOP</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/293"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/292'" >
			<td>Gan bei city</td>
			<td>jvcpfv7b</td>
			<td>GAN BEI CITY</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/292"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/291'" >
			<td>PINKO</td>
			<td>e2oouvpe</td>
			<td>PINKO</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/291"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/290'" >
			<td>smartvision</td>
			<td>46aaf4kp</td>
			<td>SMART VISION</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/290"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/289'" >
			<td>Cronus</td>
			<td>42eiitbq</td>
			<td>Cronus</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/289"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/287'" >
			<td>Vynoteka</td>
			<td>23vk7jpa</td>
			<td>Vynoteka</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/287"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/284'" >
			<td>NOI</td>
			<td>p0ripc0p</td>
			<td>NOI</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/284"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/282'" >
			<td>8togo</td>
			<td>wqdxedvs</td>
			<td>8 TO GO</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/282"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/281'" >
			<td>Gan Bei </td>
			<td>b4aa4839</td>
			<td>Gan Bei City</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/281"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/280'" >
			<td>Pet City</td>
			<td>6zytk6km</td>
			<td>Pet City</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/280"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/275'" >
			<td>Pelėda</td>
			<td>y83yrz7a</td>
			<td>Optika Pelėda</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/275"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/267'" >
			<td>Benu</td>
			<td>n7zjxsyu</td>
			<td>Benu vaistinė</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/267"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/265'" >
			<td>Beauty nail</td>
			<td>ymgk348e</td>
			<td>Beauty nail Express</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/265"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/264'" >
			<td>Gentelmans empire</td>
			<td>ju7562em</td>
			<td>Gentelman</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/264"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/260'" >
			<td>Cleangreen</td>
			<td>p88prxjk</td>
			<td>Clean Green</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/260"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/255'" >
			<td>Atlantic</td>
			<td>b0ebupjb</td>
			<td>Atlantic</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/255"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/253'" >
			<td>Hiatus GO</td>
			<td>j2mumudp</td>
			<td>Hiatus G.O.</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/253"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/252'" >
			<td>Hiatus</td>
			<td>ffmfuntv</td>
			<td>Hiatus</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/252"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/251'" >
			<td>the home story</td>
			<td>fn7x44ce</td>
			<td>The Home Story</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/251"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/246'" >
			<td>Majorica</td>
			<td>majorica1</td>
			<td>Majorica</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/246"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/242'" >
			<td>Aeronautica Militare</td>
			<td>militare1</td>
			<td>Aeronautica Militare</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/242"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/241'" >
			<td>pjazz</td>
			<td>pjazz1</td>
			<td>PJazz</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/241"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/239'" >
			<td>Cascada</td>
			<td>6jqp80ks</td>
			<td>Cascada</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/239"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/235'" >
			<td>Wolford</td>
			<td>Wolford1</td>
			<td>Wolford</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/235"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/232'" >
			<td>TwinSet</td>
			<td>r7qtsrmc</td>
			<td>Twin Set</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/232"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/231'" >
			<td>Michael Kors</td>
			<td>kors123</td>
			<td>Michael Kors</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/231"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/230'" >
			<td>makemyday</td>
			<td>r0thso8h</td>
			<td>Make My Day</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/230"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/229'" >
			<td>lemon_gym</td>
			<td>GYM_2019</td>
			<td>Lemon Gym</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/229"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/228'" >
			<td>mohito</td>
			<td>s2bsrfy7</td>
			<td>Mohito</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/228"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/224'" >
			<td>1001_naktis</td>
			<td>ypfqrwam</td>
			<td>1001 Naktis</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/224"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/221'" >
			<td>the_garden</td>
			<td>hqjwaqrw</td>
			<td>The Garden</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/221"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartojas/219'" >
			<td>mobili_linija</td>
			<td>erd5m</td>
			<td>Mobili linija</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/219"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/218'" >
			<td>golfin</td>
			<td>753</td>
			<td>Golfo treniruočių centras</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/218"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/217'" >
			<td>Ecco</td>
			<td>159</td>
			<td>Ecco</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/217"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/216'" >
			<td>staipa</td>
			<td>wymv8ez6</td>
			<td>Staipa</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/216"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/210'" >
			<td>Takeway</td>
			<td>123</td>
			<td>Takeway</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/210"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/206'" >
			<td>MaxCo</td>
			<td>levuo</td>
			<td>MAx & Co</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/206"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/204'" >
			<td>karen_millen</td>
			<td>r6ra56i5</td>
			<td>Karen Millen</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/204"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/198'" >
			<td>JuliaJanus</td>
			<td>r2z0zmih</td>
			<td>Julia Janus</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/198"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/194'" >
			<td>camelia</td>
			<td>2ngoevhs</td>
			<td>Camelia vaistinė</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/194"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/191'" >
			<td>Happeak</td>
			<td>bambizas1</td>
			<td>Happeak</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/191"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/185'" >
			<td>jahontsLT</td>
			<td>jahonts123</td>
			<td>Jahonts LT</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/185"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/184'" >
			<td>vapiano</td>
			<td>vapiano123</td>
			<td>Vapiano</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/184"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/180'" >
			<td>Laurel/Elegance</td>
			<td>Laurel123</td>
			<td>Laurel/Elegance</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/180"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/179'" >
			<td>douglas</td>
			<td>douglas123</td>
			<td>Douglas</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/179"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/178'" >
			<td>Coffee_inn</td>
			<td>skanikava</td>
			<td>Coffee Inn</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/178"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/175'" >
			<td>biosala</td>
			<td>x2skvpd8</td>
			<td>Bio sala</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/175"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/171'" >
			<td>vaga</td>
			<td>yzyc8ykr</td>
			<td>Vaga</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/171"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/170'" >
			<td>alikante</td>
			<td>cxz6xxkt</td>
			<td>ALIKANTE</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/170"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/165'" >
			<td>stefanel</td>
			<td>naujas</td>
			<td>Stefanel</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/165"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/58'" >
			<td>audimas</td>
			<td>5ce2a</td>
			<td>Audimas</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/58"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/60'" >
			<td>auksocentras</td>
			<td>fc0d4</td>
			<td>Aukso centras</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/60"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/62'" >
			<td>bagsmore</td>
			<td>a7798</td>
			<td>Bags & More</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/62"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/69'" >
			<td>candd</td>
			<td>309ef</td>
			<td>C&D Style</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/69"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/77'" >
			<td>danija</td>
			<td>e7756</td>
			<td>Danija</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/77"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/80'" >
			<td>drogas</td>
			<td>a0e0b</td>
			<td>Drogas</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/80"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/82'" >
			<td>eaglevision</td>
			<td>vizija2232</td>
			<td>Eagle Vision</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/82"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/88'" >
			<td>etamlingerie</td>
			<td>1de5b</td>
			<td>Etam Lingerie</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/88"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/92'" >
			<td>figarosalonas</td>
			<td>6b723</td>
			<td>Figaro salonas</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/92"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/93'" >
			<td>fortas</td>
			<td>91f92</td>
			<td>Fortas</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/93"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/95'" >
			<td>fuji</td>
			<td>37c03</td>
			<td>Fuji</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/95"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/98'" >
			<td>gerryweber</td>
			<td>ac643</td>
			<td>Gerry Weber</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/98"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/101'" >
			<td>ieva</td>
			<td>655c7</td>
			<td>Ieva</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/101"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/102'" >
			<td>imdeco</td>
			<td>imdeco15</td>
			<td>Im deco</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/102"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/103'" >
			<td>jogle</td>
			<td>518bd</td>
			<td>Joglė</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/103"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/104'" >
			<td>kelioniuopera</td>
			<td>dba09</td>
			<td>Samsonite</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/104"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/107'" >
			<td>loccitane</td>
			<td>d2622</td>
			<td>L'Occitane</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/107"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/108'" >
			<td>marcopolo</td>
			<td>47532</td>
			<td>Marc O</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/108"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/110'" >
			<td>maxima</td>
			<td>1245b</td>
			<td>Maxima</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/110"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/113'" >
			<td>migle</td>
			<td>f388b</td>
			<td>Miglė</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/113"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/114'" >
			<td>miyako</td>
			<td>d773e</td>
			<td>Miyako</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/114"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/117'" >
			<td>musuknyga</td>
			<td>623bdd</td>
			<td>Vaga</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/117"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/125'" >
			<td>presto</td>
			<td>920e7</td>
			<td>Presto</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/125"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/133'" >
			<td>sauliusirvidas</td>
			<td>0aaff</td>
			<td>Sauliaus ir Vido ateljė</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/133"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/134'" >
			<td>shishigeles</td>
			<td>5d15d</td>
			<td>Shi-shi gėlės</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/134"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr class="odd" onclick="location.href = '/nuomininkams/admin/vartotojas/137'" >
			<td>smaragdovaistine</td>
			<td>010fe</td>
			<td>Smaragdo vaistinė</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/137"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr  onclick="location.href = '/nuomininkams/admin/vartotojas/140'" >
			<td>suitsupply</td>
			<td>eb279</td>
			<td>Suit supply</td>
			<td><a href="/nuomininkams/admin/vartotojai/edit/140"><img src="files/images/edit.gif" alt="Redaguoti"></a></td>
		</tr><tr><td></td><td></td><td></td><td></td><td></td></tr>
"""

rows = re.findall(r'<tr.*?>\s*<td>(.*?)</td>\s*<td>(.*?)</td>\s*<td>(.*?)</td>', html_input, re.DOTALL)

with open("/Users/gvozdovic/Desktop/WEB Projects/pceuropa/supabase/migrations/004_insert_users.sql", "w") as f:
    f.write("-- supabase/migrations/004_insert_users.sql\\n")
    f.write("-- This script inserts users into auth.users and public.tenants\\n\\n")

    f.write("DO $$\\nDECLARE\\n  new_user_id uuid;\\nBEGIN\\n")
    
    for username, pwd, store_name in rows:
        username = username.strip()
        pwd = pwd.strip()
        store_name = store_name.strip()
        
        # We need to construct an email for auth.users.
        # Let's use a normalized version of store_name @ pceuropa.lt
        email_base = re.sub(r'[^a-zA-Z0-9]', '', username).lower()
        if not email_base:
            email_base = 'user'
        email = f"{email_base}@pceuropa.lt"
        
        f.write(f"  -- User: {username}, {store_name}\\n")
        f.write(f"  new_user_id := gen_random_uuid();\\n")
        f.write(f"  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)\\n")
        f.write(f"  VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', '{email}', crypt('{pwd}', gen_salt('bf')), now(), '{{\"provider\":\"email\", \"providers\":[\"email\"], \"role\":\"seller\"}}', '{{\"name\":\"{store_name}\"}}', now(), now(), 'authenticated', 'authenticated');\\n\\n")
        
        f.write(f"  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)\\n")
        f.write(f"  VALUES (gen_random_uuid(), new_user_id, format('{{\"sub\":\"%s\",\"email\":\"%s\"}}', new_user_id::text, '{email}')::jsonb, 'email', now(), now(), now());\\n\\n")

        f.write(f"  INSERT INTO public.tenants (user_id, store_name, operator, login_password)\\n")
        f.write(f"  VALUES (new_user_id, '{store_name}', '{username}', '{pwd}');\\n\\n")

    f.write("END $$;\\n")
