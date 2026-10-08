"""Blender/Cycles layer: studio, macro camera, Vertus materials, geometry from arrays.

Runs inside the `bpy` Python module (Blender 5.2 from PyPI), fully headless.
All geometry arrives as numpy arrays from the engine; nothing is hand-modelled.
"""
import math
import warnings

import bpy
import numpy as np
from mathutils import Vector

warnings.filterwarnings("ignore", category=DeprecationWarning)


# ----------------------------------------------------------------------------- scene


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def setup_render(res=(1080, 1920), spp=96, threshold=0.02, denoise=True, threads=4,
                 look="None", exposure=0.0, transparent=True, view="Khronos PBR Neutral",
                 bounces=(3, 3, 10, 8), motion_blur=False, fps=24, clamp=12.0):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    cy = sc.cycles
    cy.device = "CPU"
    cy.samples = spp
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = threshold
    cy.adaptive_min_samples = min(24, spp)
    cy.use_denoising = denoise
    if denoise:
        cy.denoiser = "OPENIMAGEDENOISE"
        cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
        cy.denoising_prefilter = "ACCURATE"
    diff, gloss, trans, transp = bounces
    cy.max_bounces = max(diff, gloss, trans) + 2
    cy.diffuse_bounces = diff
    cy.glossy_bounces = gloss
    cy.transmission_bounces = trans
    cy.transparent_max_bounces = transp
    cy.volume_bounces = 1
    cy.sample_clamp_indirect = clamp
    cy.caustics_reflective = True
    cy.caustics_refractive = True
    cy.blur_glossy = 0.6
    cy.use_light_tree = True
    sc.cycles_curves.shape = "THICK"
    sc.cycles_curves.subdivisions = 3
    r = sc.render
    r.resolution_x, r.resolution_y = res
    r.resolution_percentage = 100
    r.threads_mode = "FIXED"
    r.threads = threads
    r.film_transparent = transparent
    r.fps = fps
    r.use_motion_blur = motion_blur
    r.motion_blur_shutter = 0.5
    r.image_settings.file_format = "PNG"
    r.image_settings.color_mode = "RGBA" if transparent else "RGB"
    r.image_settings.color_depth = "16"
    vs = sc.view_settings
    vs.view_transform = view
    vs.look = look if view == "AgX" else "None"
    vs.exposure = exposure
    vs.gamma = 1.0
    return sc


def world_studio(strength=1.0, color=(1.0, 0.985, 0.99), floor_tint=(0.93, 0.92, 0.94), seen=1.15, flags=False):
    """White cyclorama as an environment.

    Diffuse bounces see a dim fill (`strength`) so folds stay deep, while
    reflection and refraction rays see the bright white cyc (`seen`), so gel
    and glass read as clear pink against white, exactly as on a real stage.
    """
    w = bpy.data.worlds.new("studio")
    w.use_nodes = True
    bpy.context.scene.world = w
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange")
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    mr.inputs["From Min"].default_value = 0.35
    mr.inputs["From Max"].default_value = 0.75
    nt.links.new(mr.outputs["Result"], mix.inputs["Factor"])
    mix.inputs["A"].default_value = (*floor_tint, 1)
    mix.inputs["B"].default_value = (*color, 1)
    nt.links.new(mix.outputs["Result"], bg.inputs["Color"])
    if flags:
        # dark flags at the horizon and below: what glass needs to show its edges
        fl = nt.nodes.new("ShaderNodeValToRGB")
        cr = fl.color_ramp
        cr.elements[0].position = 0.0; cr.elements[0].color = (0.62, 0.6, 0.62, 1)
        cr.elements[1].position = 1.0; cr.elements[1].color = (1.0, 1.0, 1.0, 1)
        for pos, v in ((0.42, 0.95), (0.5, 0.2), (0.56, 0.9), (0.7, 1.0)):
            e = cr.elements.new(pos); e.color = (v, v * 0.985, v, 1)
        nt.links.new(sep.outputs["Z"], fl.inputs["Fac"])
        lp0 = nt.nodes.new("ShaderNodeLightPath")
        gm = nt.nodes.new("ShaderNodeMath"); gm.operation = "MAXIMUM"
        nt.links.new(lp0.outputs["Is Glossy Ray"], gm.inputs[0])
        nt.links.new(lp0.outputs["Is Transmission Ray"], gm.inputs[1])
        mix2 = nt.nodes.new("ShaderNodeMix"); mix2.data_type = "RGBA"
        nt.links.new(gm.outputs[0], mix2.inputs["Factor"])
        nt.links.new(mix.outputs["Result"], mix2.inputs["A"])
        nt.links.new(fl.outputs["Color"], mix2.inputs["B"])
        nt.links.new(mix2.outputs["Result"], bg.inputs["Color"])
    lp = nt.nodes.new("ShaderNodeLightPath")
    mx = nt.nodes.new("ShaderNodeMath"); mx.operation = "MAXIMUM"
    nt.links.new(lp.outputs["Is Glossy Ray"], mx.inputs[0])
    nt.links.new(lp.outputs["Is Transmission Ray"], mx.inputs[1])
    st = nt.nodes.new("ShaderNodeMapRange")
    st.inputs["From Min"].default_value = 0.0
    st.inputs["From Max"].default_value = 1.0
    st.inputs["To Min"].default_value = strength
    st.inputs["To Max"].default_value = seen
    nt.links.new(mx.outputs[0], st.inputs["Value"])
    nt.links.new(st.outputs["Result"], bg.inputs["Strength"])
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return w


def look_at(obj, target, up=(0, 0, 1)):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def area_light(name, loc, target, size=3.0, energy=800.0, color=(1, 1, 1), size_y=None,
               spread=180.0):
    ld = bpy.data.lights.new(name, "AREA")
    ld.shape = "RECTANGLE" if size_y else "SQUARE"
    ld.size = size
    if size_y:
        ld.size_y = size_y
    ld.energy = energy
    ld.color = color
    ld.spread = math.radians(spread)
    ob = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    look_at(ob, target)
    return ob


def studio_lights(key=1.0, rim=1.0, top=1.0, center=(0, 0, 0), scale=1.0, kick=0.0,
                  key_dir=(-0.55, -0.7, 0.62), rim_dir=(0.6, 0.55, 0.45)):
    """High-key product lighting with a real key-to-fill ratio.

    One big softbox (key) carries the form; a narrower rim from behind lifts the
    bead edges into pearl; an optional top sheet; the world supplies the fill.
    """
    c = Vector(center)
    s = scale
    kd = Vector(key_dir).normalized()
    rd = Vector(rim_dir).normalized()
    L = []
    if key > 0:
        L.append(area_light("key", c + kd * 6.0 * s, c, size=4.0 * s, energy=2200 * key * s * s,
                            color=(1.0, 0.99, 1.0)))
    if rim > 0:
        L.append(area_light("rim", c + rd * 6.0 * s, c, size=2.2 * s, energy=1600 * rim * s * s,
                            color=(0.97, 0.95, 1.0)))
    if top > 0:
        L.append(area_light("top", c + Vector((0.3, 0.2, 6.0)) * s, c, size=5.0 * s,
                            energy=900 * top * s * s))
    if kick > 0:
        L.append(area_light("kick", c + Vector((-0.2, 0.9, -0.5)).normalized() * 6.0 * s, c,
                            size=3.0 * s, energy=900 * kick * s * s, color=(1.0, 0.9, 0.95)))
    return L


def point_light(name, loc, energy=1000.0, color=(1, 1, 1), radius=0.2):
    ld = bpy.data.lights.new(name, "POINT")
    ld.energy = energy
    ld.color = color
    ld.shadow_soft_size = radius
    ob = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    return ob


def camera(loc, target, lens=100.0, fstop=2.8, focus=None, sensor=36.0, name="cam",
           blades=0, ratio=1.0, clip=(0.01, 200.0)):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.sensor_fit = "VERTICAL" if False else "AUTO"
    cd.sensor_width = sensor
    cd.clip_start, cd.clip_end = clip
    cd.dof.use_dof = fstop is not None
    if fstop is not None:
        cd.dof.aperture_fstop = fstop
        cd.dof.aperture_blades = blades
        cd.dof.aperture_ratio = ratio
        cd.dof.focus_distance = focus if focus is not None else (Vector(target) - Vector(loc)).length
    ob = bpy.data.objects.new(name, cd)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    look_at(ob, target)
    bpy.context.scene.camera = ob
    return ob


# ----------------------------------------------------------------------------- materials


def _mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    return m, nt, out


def _attr(nt, name, kind="Color"):
    a = nt.nodes.new("ShaderNodeAttribute")
    a.attribute_type = "GEOMETRY"
    a.attribute_name = name
    return a.outputs[kind]


def mat_beads(name="beads", sss=0.35, sss_scale=0.004, rough=0.38, spec=0.55, coat=0.15,
              sheen=0.25, method="BURLEY"):
    """Satin candy beads: per-bead colour, soft subsurface glow, faint lacquer."""
    m, nt, out = _mat(name)
    p = nt.nodes.new("ShaderNodeBsdfPrincipled")
    p.subsurface_method = method
    col = _attr(nt, "col")
    nt.links.new(col, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = spec
    p.inputs["Subsurface Weight"].default_value = sss
    p.inputs["Subsurface Scale"].default_value = sss_scale
    p.inputs["Subsurface Radius"].default_value = (1.0, 0.38, 0.62)
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = 0.12
    p.inputs["Sheen Weight"].default_value = sheen
    p.inputs["Sheen Roughness"].default_value = 0.4
    p.inputs["Sheen Tint"].default_value = (1.0, 0.8, 0.88, 1.0)
    # emission channel for the "thought pulse" (attribute 'glow', 0 by default)
    g = _attr(nt, "glow", "Fac")
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(g, mul.inputs[0])
    mul.inputs[1].default_value = 2.0
    nt.links.new(mul.outputs[0], p.inputs["Emission Strength"])
    p.inputs["Emission Color"].default_value = (1.0, 0.42, 0.62, 1.0)
    nt.links.new(p.outputs[0], out.inputs["Surface"])
    return m


def mat_fiber(name="fiber", rough=0.3, radial=0.35, coat=0.0, spore_tip=True):
    """Fur/fibre: Chiang hair BSDF with direct colour, white spore tips along the strand."""
    m, nt, out = _mat(name)
    h = nt.nodes.new("ShaderNodeBsdfHairPrincipled")
    h.parametrization = "COLOR"
    col = _attr(nt, "col")
    h.inputs["Roughness"].default_value = rough
    h.inputs["Radial Roughness"].default_value = radial
    h.inputs["Coat"].default_value = coat
    if "Random Roughness" in h.inputs:
        h.inputs["Random Roughness"].default_value = 0.2
    if spore_tip:
        info = nt.nodes.new("ShaderNodeHairInfo")
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.86
        ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
        ramp.color_ramp.elements[1].position = 0.97
        ramp.color_ramp.elements[1].color = (1, 1, 1, 1)
        nt.links.new(info.outputs["Intercept"], ramp.inputs["Fac"])
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        nt.links.new(ramp.outputs["Color"], mix.inputs["Factor"])
        nt.links.new(col, mix.inputs["A"])
        mix.inputs["B"].default_value = (0.95, 0.9, 0.92, 1)
        nt.links.new(mix.outputs["Result"], h.inputs["Color"])
    else:
        nt.links.new(col, h.inputs["Color"])
    nt.links.new(h.outputs[0], out.inputs["Surface"])
    return m


def mat_gel(name="gel", color=(1.0, 0.32, 0.55), density=1.4, ior=1.42, rough=0.02):
    """Refractive pink gel: clear surface, colour comes from depth (Beer-Lambert)."""
    m, nt, out = _mat(name)
    p = nt.nodes.new("ShaderNodeBsdfPrincipled")
    p.inputs["Base Color"].default_value = (1, 1, 1, 1)
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["Roughness"].default_value = rough
    p.inputs["IOR"].default_value = ior
    p.inputs["Specular IOR Level"].default_value = 0.6
    nt.links.new(p.outputs[0], out.inputs["Surface"])
    va = nt.nodes.new("ShaderNodeVolumeAbsorption")
    # absorb the complement so thick gel goes deep magenta
    va.inputs["Color"].default_value = (*color, 1)
    va.inputs["Density"].default_value = density
    nt.links.new(va.outputs[0], out.inputs["Volume"])
    return m


def mat_bubble(name="bubble", ior=1.0 / 1.42):
    m, nt, out = _mat(name)
    g = nt.nodes.new("ShaderNodeBsdfGlass")
    g.inputs["IOR"].default_value = ior
    g.inputs["Roughness"].default_value = 0.0
    nt.links.new(g.outputs[0], out.inputs["Surface"])
    return m


def mat_tissue(name="tissue", sss=0.5, rough=0.42, sheen=0.3):
    """Smooth folded tissue (the card's ribbon folds): vertex colour + soft SSS."""
    m, nt, out = _mat(name)
    p = nt.nodes.new("ShaderNodeBsdfPrincipled")
    p.subsurface_method = "BURLEY"
    col = _attr(nt, "col")
    nt.links.new(col, p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = rough
    p.inputs["Subsurface Weight"].default_value = sss
    p.inputs["Subsurface Scale"].default_value = 0.02
    p.inputs["Subsurface Radius"].default_value = (1.0, 0.38, 0.62)
    p.inputs["Sheen Weight"].default_value = sheen
    nt.links.new(p.outputs[0], out.inputs["Surface"])
    return m


# ----------------------------------------------------------------------------- geometry


def _link(name, data, mat=None):
    if mat is not None:
        data.materials.append(mat)
    ob = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def pointcloud(name, P, R, cols=None, mat=None, attrs=None):
    """True ray-traced spheres (Cycles point primitive): millions are cheap."""
    P = np.ascontiguousarray(P, dtype=np.float32)
    n = len(P)
    pc = bpy.data.pointclouds.new(name)
    pc.resize(n)
    pc.attributes["position"].data.foreach_set("vector", P.ravel())
    ra = pc.attributes.get("radius") or pc.attributes.new("radius", "FLOAT", "POINT")
    ra.data.foreach_set("value", np.ascontiguousarray(R, dtype=np.float32))
    if cols is not None:
        ca = pc.attributes.new("col", "FLOAT_COLOR", "POINT")
        C = np.ones((n, 4), dtype=np.float32)
        C[:, :3] = cols
        ca.data.foreach_set("color", C.ravel())
    for k, v in (attrs or {}).items():
        a = pc.attributes.new(k, "FLOAT", "POINT")
        a.data.foreach_set("value", np.ascontiguousarray(v, dtype=np.float32))
    return _link(name, pc, mat)


def curves(name, pts, radii, cols=None, mat=None):
    """Hair strands. pts (C, S, 3), radii (C, S), cols (C, 3) per strand."""
    pts = np.ascontiguousarray(pts, dtype=np.float32)
    C, S, _ = pts.shape
    hc = bpy.data.hair_curves.new(name)
    hc.add_curves([S] * C)
    hc.position_data.foreach_set("vector", pts.reshape(-1))
    ra = hc.attributes.get("radius") or hc.attributes.new("radius", "FLOAT", "POINT")
    ra.data.foreach_set("value", np.ascontiguousarray(radii, dtype=np.float32).reshape(-1))
    if cols is not None:
        ca = hc.attributes.new("col", "FLOAT_COLOR", "CURVE")
        Cc = np.ones((C, 4), dtype=np.float32)
        Cc[:, :3] = cols
        ca.data.foreach_set("color", Cc.ravel())
    return _link(name, hc, mat)


def mesh(name, V, F, mat=None, cols=None, smooth=True):
    me = bpy.data.meshes.new(name)
    V = np.ascontiguousarray(V, dtype=np.float32)
    F = np.ascontiguousarray(F, dtype=np.int32)
    me.vertices.add(len(V))
    me.vertices.foreach_set("co", V.ravel())
    me.loops.add(F.size)
    me.loops.foreach_set("vertex_index", F.ravel())
    me.polygons.add(len(F))
    me.polygons.foreach_set("loop_start", np.arange(0, F.size, 3, dtype=np.int32))
    me.polygons.foreach_set("loop_total", np.full(len(F), 3, dtype=np.int32))
    me.update(calc_edges=True)
    me.validate()
    if smooth:
        me.polygons.foreach_set("use_smooth", np.ones(len(F), dtype=bool))
    if cols is not None:
        ca = me.color_attributes.new("col", "FLOAT_COLOR", "POINT")
        Cc = np.ones((len(V), 4), dtype=np.float32)
        Cc[:, :3] = cols
        ca.data.foreach_set("color", Cc.ravel())
    return _link(name, me, mat)


def render(path):
    sc = bpy.context.scene
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    return path
