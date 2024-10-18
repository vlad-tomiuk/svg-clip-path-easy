$(function() {
	let aspectRatio = 1;
    const $tab = () => {
        $('.instruction .language-ch a').click(function(event) {
            event.preventDefault();
            var targetId = $(this).attr('href').replace('#', '');
            $('.instruction .content .tab').removeClass('active');
            $('.instruction .language-ch a').removeClass('active');
            $('.instruction .content .' + targetId).addClass('active');
            $(this).addClass('active');
        });
        $('.instruction .show').click(function(event) {
            $('.instruction .content').toggle();
            if ($('.instruction .content').is(':visible')) {
                $(this).html('Hide<span>⬆️</span>');
            } else {
                $(this).html('Show<span>⬇️</span>');
            }
        });
    };

    const $copyCode = () => {
        $('.btn-copy-js').click(function() {
            var parentCodeBlock = $(this).closest('.code');
            var codeContent = parentCodeBlock.find('code').text();
            var tempInput = $('<textarea>');
            $('body').append(tempInput);
            tempInput.val(codeContent).select();
            document.execCommand("copy");
            tempInput.remove();
            $(this).html('<span class="icon-copy material-symbols-outlined">content_copy</span>Copied successfully!');
            setTimeout(() => {
                $(this).html('<span class="icon-copy material-symbols-outlined">content_copy</span>Copy');
            }, 1000);
        });
    };

	const $loadSVG = () => {
		function calcAspectRatio(){
			var svgElement = $('#svgPreview svg')[0];
			if (svgElement) {
				var width = svgElement.getAttribute('width');
				var height = svgElement.getAttribute('height');
				if (!width || !height) {
					var boundingBox = svgElement.getBBox();
						width = boundingBox.width;
						height = boundingBox.height;
				}
				aspectRatio = (height / (width / 100)) / 100;
				aspectRatio = aspectRatio.toFixed(5);
			}
		}
		function readSingleSvgFile(e) {
			$('#clipPath, .example').removeClass('active');
			$('#svgPreview').show();

			var file = e.target.files[0];
			if (!file) {
				return;
			}
			var reader = new FileReader();
			reader.onload = function(e) {
				loadedSvg = e.target.result;
				$('#svgPreview').html(loadedSvg);
				calcAspectRatio();
			};
			reader.readAsText(file);
			e.target.value = '';
		}

    	$('#file-svg').change(readSingleSvgFile);
	};

	const $createNormalizeSVG = () => {
		function get_code_svg(pointsString){
	        var code = `<svg>
    <defs>
        <clipPath id="bgFigure" clipPathUnits="objectBoundingBox">
            <polygon points="${pointsString}"></polygon>
        </clipPath>
    </defs>
</svg>`;
			return code;
		};
		function get_code_css(){
			var code = `.bg{
    width: 550px;
    height: auto;
    aspect-ratio: 1 / ${aspectRatio};
    background-image: url('https://picsum.photos/550/350');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    clip-path: url(#bgFigure);
}
svg{
    width: 0;
    height: 0;
    position: absolute; 
}`;
			return code;
        };
		function allPathsToPolygons() {
			var svg = $('#svgPreview svg')[0];
			var pathArray = $(svg).find('path');
			pathArray.each(function() {
				var points = paths2polys($(this).attr('d'));
				var polygonPoints = points.toString();
				createClipPath(polygonPoints);
				var polygon = $('<polygon>').attr('points', polygonPoints);
				$(this).replaceWith(polygon);
			});
		}
		function createClipPath(polygonPoints) {
			var inputString = normalizeCoordinates(polygonPoints);
			var processedString = inputString.endsWith(',') ? inputString.slice(0, -1) : inputString;
			$('#svgPreview').hide();
			
			var codeSVG = get_code_svg(processedString);
			var escapedCodeSVG = codeSVG.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			$('.code-svg code').html(escapedCodeSVG);
            $('#clipPath').html('<div class="bg"></div>' + codeSVG);
			$('#clipPath').addClass('active');

			var codeCSS = get_code_css();
			var escapedCodeCSS = codeCSS.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			$('.code-css code').html(escapedCodeCSS);
			$('#clipPath .bg').css('aspect-ratio', '1 / ' + aspectRatio);
			$('.example').addClass('active');
		}
		function normalizeCoordinates(coordsString) {
			var coords = coordsString.split(',').map(function(item) {
				return parseFloat(item.trim());
			});
			var minX = Math.min(...coords.filter((_, index) => index % 2 === 0));
			var maxX = Math.max(...coords.filter((_, index) => index % 2 === 0));
			var minY = Math.min(...coords.filter((_, index) => index % 2 === 1));
			var maxY = Math.max(...coords.filter((_, index) => index % 2 === 1));
			var normalizedCoords = coords.map(function(value, index) {
				return index % 2 === 0
				? (value - minX) / (maxX - minX)
				: (value - minY) / (maxY - minY);
			});
			return normalizedCoords.map(function(coord, index) {
				return index % 2 === 0 ? coord : ',' + coord + ',';
			}).join('');
		}

		$('.btn-conver').click(allPathsToPolygons);
	};

    $tab();

    $copyCode();

	$loadSVG();

	$createNormalizeSVG();
});